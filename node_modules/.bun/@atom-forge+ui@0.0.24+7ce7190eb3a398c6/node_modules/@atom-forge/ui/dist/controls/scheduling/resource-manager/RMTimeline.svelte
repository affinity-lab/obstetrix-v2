<script lang="ts">
	import { getRMContext, HEADER_H } from './rm.svelte';
	import RMAllocationBar from './RMAllocationBar.svelte';
	import { addDays, isRestDay, MONTH_NAMES } from '../gantt/gantt-utils';
	import { twMerge } from 'tailwind-merge';
	import { formatDate } from '../gantt/gantt-utils';

	let { scrollTop = $bindable(0) }: { scrollTop?: number } = $props();

	let ctx = getRMContext();
	let el = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (el && el.scrollTop !== scrollTop) el.scrollTop = scrollTop;
	});

	// Month header spans
	const monthSpans = $derived.by(() => {
		const spans: { label: string; width: number; x: number }[] = [];
		let i = 0;
		while (i < ctx.totalDays) {
			const d = addDays(ctx.rangeStart, i);
			const m = d.getMonth();
			let count = 1;
			while (i + count < ctx.totalDays && addDays(ctx.rangeStart, i + count).getMonth() === m) count++;
			spans.push({ label: `${MONTH_NAMES[m]} ${d.getFullYear()}`, width: count * ctx.dayWidth, x: i * ctx.dayWidth });
			i += count;
		}
		return spans;
	});

	// Day cells for bottom header row
	const dayCells = $derived.by(() => {
		const todayStr = new Date().toDateString();
		return Array.from({ length: ctx.totalDays }, (_, i) => {
			const d = addDays(ctx.rangeStart, i);
			const rest = isRestDay(d, ctx.workdays, ctx.extraRest, ctx.extraWork);
			return { label: String(d.getDate()), x: i * ctx.dayWidth, isRest: rest, isToday: d.toDateString() === todayStr };
		});
	});

	const topRowH = 28;
	const bottomRowH = HEADER_H - topRowH;
	const todayX = $derived(ctx.todayX());

	// Handle click-to-create on the grid
	function onGridPointerDown(e: PointerEvent) {
		if (ctx.viewOnly || !ctx.activeProjectId) return;
		if ((e.target as HTMLElement).closest('.alloc-bar')) return;

		// Determine which resource row was clicked
		const gridEl = e.currentTarget as HTMLElement;
		const rect = gridEl.getBoundingClientRect();
		const relY = e.clientY - rect.top + (el?.scrollTop ?? 0);

		let cumY = 0;
		let targetResourceId: string | null = null;
		for (const row of ctx.rows) {
			if (relY >= cumY && relY < cumY + row.rowHeight) {
				targetResourceId = row.resource.id;
				break;
			}
			cumY += row.rowHeight;
		}
		if (!targetResourceId) return;

		const relX = e.clientX - rect.left + (el?.scrollLeft ?? 0);
		const dateStr = ctx.xToDate(relX);

		ctx.drag = { type: 'create', resourceId: targetResourceId, startX: e.clientX, startDate: dateStr, endDate: dateStr };
		gridEl.setPointerCapture(e.pointerId);
	}

	function onGridPointerMove(e: PointerEvent) {
		if (!ctx.drag || ctx.drag.type !== 'create') return;
		const gridEl = e.currentTarget as HTMLElement;
		const rect = gridEl.getBoundingClientRect();
		const relX = e.clientX - rect.left + (el?.scrollLeft ?? 0);
		const endDate = ctx.xToDate(relX);
		if (endDate >= ctx.drag.startDate) {
			ctx.drag = { ...ctx.drag, endDate };
		}
	}

	function onGridPointerUp(e: PointerEvent) {
		if (!ctx.drag || ctx.drag.type !== 'create') return;
		const { resourceId, startDate, endDate } = ctx.drag;
		if (startDate !== endDate) {
			ctx.addAllocation(resourceId, startDate, endDate);
		}
		ctx.drag = null;
	}

	// Ghost bar while creating
	const ghostBar = $derived.by(() => {
		if (!ctx.drag || ctx.drag.type !== 'create') return null;
		const { resourceId, startDate, endDate } = ctx.drag;
		const row = ctx.rows.find(r => r.resource.id === resourceId);
		if (!row) return null;
		const x = ctx.dateToX(startDate);
		const endX = ctx.dateToX(endDate) + ctx.dayWidth;
		return { x, y: row.offsetY + 6, w: Math.max(ctx.dayWidth, endX - x), h: row.rowHeight - 12 };
	});
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<div
		bind:this={el}
		class="flex-1 overflow-auto"
		onscroll={() => { if (el) scrollTop = el.scrollTop; }}
	>
		<div style="width: {ctx.totalWidth}px; min-width: 100%">
			<!-- Sticky header -->
			<div class="sticky top-0 z-20 border-b border-frame bg-canvas overflow-hidden" style="height: {HEADER_H}px; width: {ctx.totalWidth}px">
				<!-- Month row -->
				<div class="absolute inset-x-0 top-0" style="height: {topRowH}px">
					{#each monthSpans as span}
						<div class="absolute top-0 h-full flex items-center px-2 border-r border-frame text-xs font-semibold text-canvas-contrast" style="left: {span.x}px; width: {span.width}px">
							{span.label}
						</div>
					{/each}
				</div>
				<!-- Day row -->
				{#if ctx.dayWidth >= 20}
					<div class="absolute inset-x-0 border-t border-frame" style="top: {topRowH}px; height: {bottomRowH}px">
						{#each dayCells as day}
							<div
								class={twMerge(
									'absolute top-0 h-full flex items-center justify-center border-r border-frame text-[10px]',
									day.isRest ? 'text-muted-contrast bg-muted/40' : 'text-canvas-contrast',
									day.isToday && 'font-bold text-accent',
								)}
								style="left: {day.x}px; width: {ctx.dayWidth}px"
							>
								{day.label}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Grid body -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative"
				style="height: {ctx.totalHeight}px; width: {ctx.totalWidth}px"
				onpointerdown={onGridPointerDown}
				onpointermove={onGridPointerMove}
				onpointerup={onGridPointerUp}
			>
				<!-- Vertical day lines -->
				{#if ctx.dayWidth >= 20}
					{#each { length: ctx.totalDays } as _, i}
						<div class="absolute top-0 bottom-0 border-r border-frame/50" style="left: {(i + 1) * ctx.dayWidth - 1}px; width: 1px"></div>
					{/each}
				{/if}

				<!-- Rest columns -->
				{#each dayCells.filter(d => d.isRest) as day}
					<div class="absolute top-0 bottom-0 bg-muted/25" style="left: {day.x}px; width: {ctx.dayWidth}px"></div>
				{/each}

				<!-- Row separators + alternating bg -->
				{#each ctx.rows as row, i}
					{#if i % 2 === 1}
						<div class="absolute left-0 right-0 bg-canvas/50" style="top: {row.offsetY}px; height: {row.rowHeight}px"></div>
					{/if}
					<div class="absolute left-0 right-0 border-b border-frame/40" style="top: {row.offsetY + row.rowHeight - 1}px; height: 1px"></div>
				{/each}

				<!-- Today line -->
				{#if todayX >= 0 && todayX <= ctx.totalWidth}
					<div class="absolute top-0 bottom-0 w-0.5 bg-accent/60 z-10" style="left: {todayX}px">
						<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent"></div>
					</div>
				{/if}

				<!-- Allocation bars -->
				{#each ctx.rows as row (row.resource.id)}
					{#each row.laned as laned (laned.alloc.id)}
						<div class="alloc-bar">
							<RMAllocationBar {laned} rowOffsetY={row.offsetY} />
						</div>
					{/each}
				{/each}

				<!-- Ghost bar while creating -->
				{#if ghostBar}
					<div
						class="absolute rounded pointer-events-none border-2 border-dashed border-accent/60 bg-accent/20"
						style="left: {ghostBar.x}px; top: {ghostBar.y}px; width: {ghostBar.w}px; height: {ghostBar.h}px"
					></div>
				{/if}
			</div>
		</div>
	</div>
</div>
