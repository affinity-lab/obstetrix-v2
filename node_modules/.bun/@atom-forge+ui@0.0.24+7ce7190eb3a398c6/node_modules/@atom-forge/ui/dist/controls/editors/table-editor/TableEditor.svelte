<script lang="ts">
	import type {TableData, ColStyle} from "./types";
	import {makeDefaultTableData} from "./helpers"
	import {type Snippet, untrack} from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { AlignLeft, AlignCenter, AlignRight, Plus, X, Settings2, GripHorizontal, Trash2 } from 'lucide-svelte';
	import { Switch } from '../../forms/switch';
import { PopupContainer, createPopupManager, getPopupManager } from '../../overlays/popup';
import { dnd } from '../../../helpers/actions';
import { as } from '../../../helpers/as';
	import SheetClipCtor from 'sheetclip';
	const sc = new (SheetClipCtor as any)();


	const toToggleKey = as<'headingRow' | 'headingCol' | 'sumRow' | 'sumCol'>;
	const toColSide   = as<'left' | 'right'>;
	const toRowSide   = as<'top' | 'bottom'>;

	createPopupManager();
	const popup = getPopupManager();

	let {
		value = $bindable(makeDefaultTableData()),
		onchange,
	}: {
		value?:    TableData;
		onchange?: (v: TableData) => void;
	} = $props();

	let td = $state<TableData>(untrack(() => value));
	let lastEmitted: TableData | null = null;

	$effect(() => {
		const v = value;
		if (v === lastEmitted) return;
		untrack(() => { td = v; });
	});

	const colCount = $derived(td.rows[0]?.length ?? 0);
	const rowCount = $derived(td.rows.length);

	function save(next: TableData) {
		td = next;
		lastEmitted = next;
		onchange?.(next);
	}

	function addRow(after = rowCount - 1) {
		const rows = [...td.rows];
		rows.splice(after + 1, 0, Array(colCount).fill(''));
		save({ ...td, rows });
	}
	function delRow(i: number) {
		if (rowCount <= 1) return;
		save({ ...td, rows: td.rows.filter((_, idx) => idx !== i) });
	}
	function addCol(after = colCount - 1) {
		const at   = after + 1;
		const rows = td.rows.map(r => { const nr = [...r]; nr.splice(at, 0, ''); return nr; });
		const cs   = [...td.colStyles]; cs.splice(at, 0, { align: 'left', prefix: '', postfix: '', sumDecorator: false });
		save({ ...td, rows, colStyles: cs });
	}
	function delCol(c: number) {
		if (colCount <= 1) return;
		save({
			...td,
			rows:      td.rows.map(r => r.filter((_, i) => i !== c)),
			colStyles: td.colStyles.filter((_, i) => i !== c),
		});
	}
	function setCell(r: number, c: number, v: string) {
		save({ ...td, rows: td.rows.map((row, ri) => ri !== r ? row : row.map((cell, ci) => ci === c ? v : cell)) });
	}
	function setAlign(c: number, align: ColStyle['align']) {
		save({ ...td, colStyles: td.colStyles.map((s, i) => i === c ? { ...s, align } : s) });
	}
	function setStr(c: number, k: 'prefix' | 'postfix', v: string) {
		save({ ...td, colStyles: td.colStyles.map((s, i) => i === c ? { ...s, [k]: v } : s) });
	}
	function toggleColDecorator(c: number) {
		save({ ...td, colStyles: td.colStyles.map((s, i) => i === c ? { ...s, sumDecorator: !s.sumDecorator } : s) });
	}
	function toggle(k: keyof Pick<TableData, 'headingRow' | 'headingCol' | 'sumRow' | 'sumCol'>) {
		save({ ...td, [k]: !td[k] });
	}

	function autogrow(node: HTMLTextAreaElement) {
		function resize() { node.style.height = 'auto'; node.style.height = node.scrollHeight + 'px'; }
		resize();
		node.addEventListener('input', resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	function handlePaste(e: ClipboardEvent, startR: number, startC: number) {
		const text = e.clipboardData?.getData('text/plain') ?? '';
		const parsed: string[][] = sc.parse(text);
		if (parsed.length <= 1 && (parsed[0]?.length ?? 0) <= 1) return;
		e.preventDefault();

		const pasteRows = parsed.length;
		const pasteCols = Math.max(...parsed.map(r => r.length));
		let next = { ...td };

		// Expand rows if needed
		const neededRows = startR + pasteRows;
		if (neededRows > next.rows.length) {
			const newRows = [...next.rows];
			for (let i = next.rows.length; i < neededRows; i++)
				newRows.push(Array(next.rows[0]?.length ?? 0).fill(''));
			next = { ...next, rows: newRows };
		}

		// Expand cols if needed
		const neededCols = startC + pasteCols;
		const curCols = next.rows[0]?.length ?? 0;
		if (neededCols > curCols) {
			const addCount = neededCols - curCols;
			const newColStyles = [...next.colStyles];
			for (let i = 0; i < addCount; i++)
				newColStyles.push({ align: 'left', prefix: '', postfix: '', sumDecorator: false });
			const newRows = next.rows.map(r => { const nr = [...r]; for (let i = 0; i < addCount; i++) nr.push(''); return nr; });
			next = { ...next, rows: newRows, colStyles: newColStyles };
		}

		// Fill values
		const newRows = next.rows.map(r => [...r]);
		for (let pr = 0; pr < parsed.length; pr++)
			for (let pc = 0; pc < parsed[pr].length; pc++)
				newRows[startR + pr][startC + pc] = parsed[pr][pc];
		save({ ...next, rows: newRows });
	}

	function moveFocus(tableEl: HTMLElement, r: number, c: number) {
		if (r < 0 || r >= rowCount || c < 0 || c >= colCount) return;
		(tableEl.querySelector(`[data-cell="${r},${c}"]`) as HTMLTextAreaElement)?.focus();
	}
	function handleCellKey(e: KeyboardEvent, r: number, c: number) {
		const el      = e.currentTarget as HTMLTextAreaElement;
		const tableEl = el.closest('[data-table-editor]') as HTMLElement;
		const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
		const atEnd   = el.selectionStart === el.value.length && el.selectionEnd === el.value.length;

		if (e.key === 'Tab') {
			e.preventDefault();
			if (e.shiftKey) { if (c > 0) moveFocus(tableEl, r, c - 1); else if (r > 0) moveFocus(tableEl, r - 1, colCount - 1); }
			else            { if (c < colCount - 1) moveFocus(tableEl, r, c + 1); else if (r < rowCount - 1) moveFocus(tableEl, r + 1, 0); }
		} else if (e.key === 'Enter' && !e.shiftKey)        { e.preventDefault(); moveFocus(tableEl, r + 1, c); }
		  else if (e.key === 'ArrowRight' && atEnd)         { e.preventDefault(); moveFocus(tableEl, r, c + 1); }
		  else if (e.key === 'ArrowLeft'  && atStart)       { e.preventDefault(); moveFocus(tableEl, r, c - 1); }
		  else if (e.key === 'ArrowDown'  && atEnd)         { e.preventDefault(); moveFocus(tableEl, r + 1, c); }
		  else if (e.key === 'ArrowUp'    && atStart)       { e.preventDefault(); moveFocus(tableEl, r - 1, c); }
	}

	let hovHeaderC  = $state<number | null>(null);  // hovering a column header th
	let hovHeaderR  = $state<number | null>(null);  // hovering a row header td
	let hovCellR    = $state<number | null>(null);  // hovering a data cell (row)
	let hovCellC    = $state<number | null>(null);  // hovering a data cell (col)
	let focusedCell = $state<string | null>(null);

	let draggingCol  = $state<number | null>(null);
	let dropCol      = $state<number | null>(null);
	let dropSide     = $state<'left' | 'right' | null>(null);

	let draggingRow  = $state<number | null>(null);
	let dropRow      = $state<number | null>(null);
	let dropRowSide  = $state<'top' | 'bottom' | null>(null);

	function reorderRow(from: number, to: number) {
		if (from === to) return;
		const rows = [...td.rows];
		const [removed] = rows.splice(from, 1);
		rows.splice(to, 0, removed);
		save({ ...td, rows });
	}

	function reorderCol(from: number, to: number) {
		if (from === to) return;
		const cols = [...td.colStyles];
		const rows = td.rows.map(r => [...r]);
		const [removedStyle] = cols.splice(from, 1);
		cols.splice(to, 0, removedStyle);
		for (const row of rows) {
			const [removedCell] = row.splice(from, 1);
			row.splice(to, 0, removedCell);
		}
		save({ ...td, colStyles: cols, rows });
	}

	function ib(active: boolean, extra = '') {
		return twMerge(
			'flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-colors',
			active ? 'bg-accent/15 text-accent' : 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary',
			extra,
		);
	}

	function colLabel(c: number): string {
		let label = '';
		let n = c;
		do {
			label = String.fromCharCode(65 + (n % 26)) + label;
			n = Math.floor(n / 26) - 1;
		} while (n >= 0);
		return label;
	}
</script>

<div class="space-y-2">
	<!-- Toggle toolbar -->
	<div class="flex flex-wrap gap-1">
		{#each [['headingRow','H-Row'],['headingCol','H-Col'],['sumRow','Σ Row'],['sumCol','Σ Col']] as [k, lbl]}
			{@const on = as.boolean(td[toToggleKey(k)])}
			<button
				class={twMerge('px-2 py-0.5 rounded-md border text-xs transition-colors cursor-pointer',
					on ? 'bg-accent text-primary-contrast border-accent' : 'border-frame text-muted-contrast hover:bg-secondary')}
				onclick={() => toggle(toToggleKey(k))}
			>{lbl}</button>
		{/each}
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-lg border border-frame" data-table-editor>
		<table class="border-collapse w-full">
			<thead>
				<tr>
					<th class="w-7 border-b border-r border-frame bg-muted/50 p-0"></th>
					{#each td.colStyles as cs, c}
					<th
						class={twMerge(
							'border-b border-r border-frame p-0 relative last:border-r-0 transition-colors',
							(hovCellC === c || hovHeaderC === c) ? 'bg-accent/15' : 'bg-muted/50',
							draggingCol === c && 'opacity-40',
							dropCol === c && dropSide === 'left'  && 'border-l-2 border-l-accent',
							dropCol === c && dropSide === 'right' && 'border-r-2 border-r-accent',
						)}
						onmouseenter={() => hovHeaderC = c}
						onmouseleave={() => hovHeaderC = null}
							use:dnd.draggable={{
								data: { colIndex: c },
								dragHandleSelector: '[data-drag-handle]',
								onDragStart: () => { draggingCol = c; },
								onDrop: () => { draggingCol = null; },
							}}
							use:dnd.dropTarget={{
								getData: ({ input, element }) => {
									const rect = element.getBoundingClientRect();
									const side = input.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
									return { colIndex: c, side };
								},
								onDragEnter: ({ self }) => {
									dropCol  = as.number(self.data.colIndex);
									dropSide = toColSide(self.data.side);
								},
								onDrag: ({ self }) => {
									dropCol  = as.number(self.data.colIndex);
									dropSide = toColSide(self.data.side);
								},
								onDragLeave: () => { dropCol = null; dropSide = null; },
								onDrop: ({ source, self }) => {
									const from = as.number(source.data.colIndex);
									const side = toColSide(self.data.side);
									let to = as.number(self.data.colIndex);
									if (side === 'right') to += 1;
									if (from < to) to -= 1;
									reorderCol(from, to);
									dropCol = null; dropSide = null;
								},
							}}
						>
							{#if hovHeaderC === c}
								<div class="flex items-center gap-0.5 px-1 py-0.5">
									<!-- Drag handle -->
									<div
										data-drag-handle
										class="flex items-center justify-center w-4 h-5 rounded cursor-grab text-muted-contrast hover:text-canvas-contrast pointer-events-auto"
										title="Drag to reorder"
									>
										<GripHorizontal size={11}/>
									</div>

									<!-- Align + settings -->
									<button class={ib(cs.align === 'left')}   onclick={() => setAlign(c, 'left')}   title="Align left"><AlignLeft size={11}/></button>
									<button class={ib(cs.align === 'center')} onclick={() => setAlign(c, 'center')} title="Align center"><AlignCenter size={11}/></button>
									<button class={ib(cs.align === 'right')}  onclick={() => setAlign(c, 'right')}  title="Align right"><AlignRight size={11}/></button>
									<button class={ib(popup?.popup?.ref === `cfg-${c}`)} onclick={(e) => popup?.open.snippet(as<Snippet>(colConfig), { c }, { anchor: e }, `cfg-${c}`)} title="Prefix / Postfix">
										<Settings2 size={11}/>
									</button>

									<div class="flex-1"></div>

									<!-- + X -->
									<button class={ib(false)} onclick={() => addCol(c)} title="Insert column after"><Plus size={11}/></button>
									<button class={ib(false, 'hover:text-error!')} onclick={(e) => popup?.open.snippet(as<Snippet>(delConfirm), { onconfirm: () => { delCol(c); popup?.close(); } }, { anchor: e }, `del-col-${c}`)} title="Delete column"><X size={11}/></button>
								</div>
							{:else}
								<div class={twMerge(
									'flex items-center justify-center py-0.5 text-xs font-mono font-semibold select-none',
									hovCellC === c ? 'text-accent' : 'text-muted-contrast',
								)}>
									{colLabel(c)}
								</div>
							{/if}

						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each td.rows as row, r}
					<tr
						onmouseenter={() => hovCellR = r}
						onmouseleave={() => hovCellR = null}
						use:dnd.draggable={{
							data: { rowIndex: r },
							dragHandleSelector: '[data-row-drag-handle]',
							onDragStart: () => { draggingRow = r; },
							onDrop: () => { draggingRow = null; },
						}}
						use:dnd.dropTarget={{
							getData: ({ input, element }) => {
								const rect = element.getBoundingClientRect();
								const side = input.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
								return { rowIndex: r, side };
							},
							onDragEnter: ({ self }) => { dropRow = as.number(self.data.rowIndex); dropRowSide = toRowSide(self.data.side); },
							onDrag:      ({ self }) => { dropRow = as.number(self.data.rowIndex); dropRowSide = toRowSide(self.data.side); },
							onDragLeave: () => { dropRow = null; dropRowSide = null; },
							onDrop: ({ source, self }) => {
								const from = as.number(source.data.rowIndex);
								const side = toRowSide(self.data.side);
								let to = as.number(self.data.rowIndex);
								if (side === 'bottom') to += 1;
								if (from < to) to -= 1;
								reorderRow(from, to);
								dropRow = null; dropRowSide = null;
							},
						}}
					>
						<!-- Row controls -->
						<td class={twMerge(
							'w-7 border-t border-r border-frame p-0 transition-colors',
							(hovCellR === r || hovHeaderR === r) ? 'bg-accent/15' : 'bg-muted/20',
							draggingRow === r && 'opacity-40',
							dropRow === r && dropRowSide === 'top'    && 'border-t-2 border-t-accent',
							dropRow === r && dropRowSide === 'bottom' && 'border-b-2 border-b-accent',
						)}
							onmouseenter={() => hovHeaderR = r}
							onmouseleave={() => hovHeaderR = null}
						>
							{#if hovHeaderR === r}
								<div class="flex flex-col items-center justify-center gap-px py-0.5">
									<div data-row-drag-handle class="flex items-center justify-center w-5 h-4 rounded cursor-grab text-muted-contrast hover:text-canvas-contrast" title="Drag to reorder">
										<GripHorizontal size={9}/>
									</div>
									<button class="flex items-center justify-center w-5 h-4 rounded text-muted-contrast hover:text-canvas-contrast hover:bg-secondary cursor-pointer" onclick={() => addRow(r)} title="Insert row below"><Plus size={9}/></button>
									<button class="flex items-center justify-center w-5 h-4 rounded text-muted-contrast hover:text-error cursor-pointer" onclick={(e) => popup?.open.snippet(as<Snippet>(delConfirm), { onconfirm: () => { delRow(r); popup?.close(); } }, { anchor: e }, `del-row-${r}`)} title="Delete row"><X size={9}/></button>
								</div>
							{:else}
								<div class={twMerge(
									'flex items-center justify-center text-xs font-mono font-semibold select-none py-1',
									hovCellR === r ? 'text-accent' : 'text-muted-contrast',
								)}>
									{r + 1}
								</div>
							{/if}
						</td>

						{#each row as cell, c}
							{@const isHead   = (td.headingRow && r === 0) || (td.headingCol && c === 0)}
							{@const isSum    = !isHead && ((td.sumRow && r === rowCount - 1) || (td.sumCol && c === colCount - 1))}
							{@const cs       = td.colStyles[c]}
							{@const showDeco = !isHead && (!isSum || cs?.sumDecorator)}
							{@const focused  = focusedCell === `${r},${c}`}
							<td
								onmouseenter={() => hovCellC = c}
								onmouseleave={() => hovCellC = null}
								class={twMerge(
								'border-t border-r border-frame p-0 last:border-r-0 transition-colors',
								isHead  ? 'bg-muted' : '',
								isSum   ? 'bg-accent/10' : '',
								focused ? (isHead ? 'bg-muted/60' : isSum ? 'bg-accent/20' : 'bg-accent/5') : '',
								(draggingCol === c || draggingRow === r) && 'opacity-40',
								dropCol === c && dropSide === 'left'      && 'border-l-2 border-l-accent',
								dropCol === c && dropSide === 'right'     && 'border-r-2 border-r-accent',
								dropRow === r && dropRowSide === 'top'    && 'border-t-2 border-t-accent',
								dropRow === r && dropRowSide === 'bottom' && 'border-b-2 border-b-accent',
							)}>
								<div class="flex items-start gap-0.5 px-2">
									{#if cs?.prefix && showDeco}
										<span class="text-muted-contrast text-xs shrink-0 select-none pt-[7px]">{cs.prefix}</span>
									{/if}
									<textarea
										data-cell="{r},{c}"
										use:autogrow
										value={cell}
										oninput={(e) => setCell(r, c, e.currentTarget.value)}
										onkeydown={(e) => handleCellKey(e, r, c)}
										onpaste={(e) => handlePaste(e, r, c)}
										onfocus={() => focusedCell = `${r},${c}`}
										onblur={() => focusedCell = null}
										rows={1}
										class={twMerge(
											'flex-1 min-w-[50px] w-full bg-transparent outline-none focus:outline-none ring-0 focus:ring-0 border-0 p-0 m-0 py-1.5 text-sm resize-none overflow-hidden leading-snug',
											cs?.align === 'center' ? 'text-center' : cs?.align === 'right' ? 'text-right' : 'text-left',
											isHead ? 'font-semibold text-canvas-contrast' : isSum ? 'font-semibold text-accent' : 'text-canvas-contrast',
										)}
										spellcheck={false}
									></textarea>
									{#if cs?.postfix && showDeco}
										<span class="text-muted-contrast text-xs shrink-0 select-none pt-[7px]">{cs.postfix}</span>
									{/if}
								</div>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#snippet delConfirm(params)}
	{@const onconfirm = params?.onconfirm}
	<div class="bg-surface border border-frame rounded-lg shadow-lg p-1.5">
		<button
			class="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-error hover:bg-error/10 cursor-pointer w-full transition-colors"
			onclick={onconfirm}
		>
			<Trash2 size={11}/>
			Delete
		</button>
	</div>
{/snippet}

{#snippet colConfig(params)}
	{@const c  = params?.c ?? 0}
	{@const cs = td.colStyles[c]}
	<div class="bg-surface border border-frame rounded-lg shadow-lg p-2 space-y-1.5 w-44">
		<div class="flex items-center gap-1.5">
			<span class="text-[10px] uppercase tracking-wide text-muted-contrast w-10 shrink-0">Prefix</span>
			<input
				class="flex-1 min-w-0 bg-control border border-frame rounded px-1.5 py-0.5 text-xs text-canvas-contrast outline-none focus:ring-1 ring-accent"
				value={cs?.prefix ?? ''} placeholder="e.g. $"
				oninput={(e) => setStr(c, 'prefix', e.currentTarget.value)}
			/>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-[10px] uppercase tracking-wide text-muted-contrast w-10 shrink-0">Postfix</span>
			<input
				class="flex-1 min-w-0 bg-control border border-frame rounded px-1.5 py-0.5 text-xs text-canvas-contrast outline-none focus:ring-1 ring-accent"
				value={cs?.postfix ?? ''} placeholder="e.g. %"
				oninput={(e) => setStr(c, 'postfix', e.currentTarget.value)}
			/>
		</div>
		<button class="flex items-center justify-between w-full pt-0.5 cursor-pointer" onclick={() => toggleColDecorator(c)}>
			<span class="text-xs text-muted-contrast">Show in sum rows</span>
			<Switch value={cs?.sumDecorator ?? false} small class="pointer-events-none" />
		</button>
	</div>
{/snippet}

<PopupContainer />
