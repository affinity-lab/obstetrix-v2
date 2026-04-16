<script lang="ts">
	import { untrack, tick } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { marked } from 'marked';
	import { PenLine, Columns2, Eye } from 'lucide-svelte';
	import TurndownService from 'turndown';

	const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
	td.addRule('no-images', { filter: 'img', replacement: () => '' });

	let {
		value      = '',
		onchange,
		onnavigate,
		onsplit,
		onjoinprev,
		onjoinnext,
	}: {
		value?:       string;
		onchange?:    (v: string) => void;
		onnavigate?:  (dir: 'prev' | 'next') => void;
		onsplit?:     (before: string, after: string) => void;
		onjoinprev?:  () => void;
		onjoinnext?:  () => void;
	} = $props();

	let text = $state(untrack(() => value));
	let el   = $state<HTMLTextAreaElement | undefined>(undefined);
	let mode = $state<'edit' | 'split' | 'preview'>('split');

	// Sync from parent (undo/redo)
	$effect(() => {
		const v = value;
		untrack(() => { if (v !== text) text = v; });
	});

	function autogrow(node: HTMLTextAreaElement) {
		function resize() { node.style.height = 'auto'; node.style.height = node.scrollHeight + 'px'; }
		resize();
		node.addEventListener('input', resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	function handleInput() { onchange?.(text); }

	async function handlePaste(e: ClipboardEvent) {
		const html = e.clipboardData?.getData('text/html') ?? '';
		if (!html.trim()) return;
		e.preventDefault();
		const markdown = td.turndown(html);
		if (!el) return;
		const start = el.selectionStart;
		const end   = el.selectionEnd;
		text = text.slice(0, start) + markdown + text.slice(end);
		onchange?.(text);
		await tick();
		el.setSelectionRange(start + markdown.length, start + markdown.length);
	}

	const preview = $derived(marked.parse(text) as string);

	async function wrapSelection(wrap: string) {
		if (!el) return;
		const start    = el.selectionStart;
		const end      = el.selectionEnd;
		const selected = text.slice(start, end);
		if (selected) {
			text = text.slice(0, start) + wrap + selected + wrap + text.slice(end);
			await tick();
			el.setSelectionRange(start + wrap.length, end + wrap.length);
		} else {
			text = text.slice(0, start) + wrap + wrap + text.slice(end);
			await tick();
			el.setSelectionRange(start + wrap.length, start + wrap.length);
		}
		onchange?.(text);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			e.preventDefault();
			onnavigate?.(e.shiftKey ? 'prev' : 'next');
		} else if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
			e.preventDefault();
			wrapSelection('**');
		} else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
			e.preventDefault();
			wrapSelection('*');
		} else if (e.key === 'Enter' && e.shiftKey && onsplit) {
			e.preventDefault();
			const pos = el!.selectionStart;
			onsplit(text.slice(0, pos), text.slice(el!.selectionEnd));
		} else if (e.key === 'Backspace' && onjoinprev && el!.selectionStart === 0 && el!.selectionEnd === 0) {
			e.preventDefault();
			onjoinprev();
		} else if (e.key === 'Delete' && onjoinnext && el!.selectionStart === text.length && el!.selectionEnd === text.length) {
			e.preventDefault();
			onjoinnext();
		}
	}

	export function focus(dir: 'start' | 'end' = 'start') {
		el?.focus();
		const pos = dir === 'end' ? text.length : 0;
		el?.setSelectionRange(pos, pos);
	}

	export function focusAt(pos: number) {
		el?.focus();
		el?.setSelectionRange(pos, pos);
	}

	const MODES = [
		{ id: 'edit'    as const, icon: PenLine,  label: 'Edit'    },
		{ id: 'split'   as const, icon: Columns2, label: 'Split'   },
		{ id: 'preview' as const, icon: Eye,       label: 'Preview' },
	];

	const textareaClass = 'w-full bg-transparent outline-none focus:outline-none ring-0 focus:ring-0 border-0 resize-none text-sm leading-relaxed font-light font-mono px-3 py-2 text-muted-contrast placeholder:text-muted-contrast/50';
</script>

<div class="flex flex-col">
	<!-- Toolbar -->
	<div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-frame shrink-0">
		{#each MODES as m}
			{@const ModeIcon = m.icon}
			<button
				class={twMerge(
					'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors cursor-pointer',
					mode === m.id
						? 'bg-accent/10 text-accent'
						: 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary',
				)}
				onclick={() => mode = m.id}
			>
				<ModeIcon size={13} />
				{m.label}
			</button>
		{/each}
	</div>

	<!-- Edit mode: auto-growing textarea -->
	{#if mode === 'edit'}
		<textarea
			bind:this={el}
			bind:value={text}
			use:autogrow
			class="{textareaClass} min-h-30 overflow-hidden block"
			placeholder="# Markdown..."
			rows={1}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onpaste={handlePaste}
			spellcheck={false}
		></textarea>

	<!-- Preview mode: rendered HTML, auto-height -->
	{:else if mode === 'preview'}
		<div class="px-4 py-3 min-h-12">
			{#if text.trim()}
				<div class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-canvas-contrast prose-p:text-muted-contrast prose-strong:text-canvas-contrast prose-strong:font-semibold prose-em:text-canvas-contrast prose-code:text-accent prose-blockquote:text-muted-contrast prose-li:text-muted-contrast">
					{@html preview}
				</div>
			{:else}
				<p class="text-muted-contrast text-xs italic select-none">Preview will appear here…</p>
			{/if}
		</div>

	<!-- Split mode: two columns, auto-growing height -->
	{:else}
		<div class="flex min-h-12 divide-x divide-frame">
			<!-- Left: auto-growing textarea -->
			<div class="flex-1 min-w-0">
				<textarea
					bind:this={el}
					bind:value={text}
					use:autogrow
					class="{textareaClass} overflow-hidden block"
					placeholder="# Markdown..."
					rows={1}
					oninput={handleInput}
					onkeydown={handleKeydown}
					onpaste={handlePaste}
					spellcheck={false}
				></textarea>
			</div>
			<!-- Right: rendered preview, grows to match -->
			<div class="flex-1 min-w-0 px-4 py-3">
				{#if text.trim()}
					<div class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-canvas-contrast prose-p:text-muted-contrast prose-strong:text-canvas-contrast prose-strong:font-semibold prose-em:text-canvas-contrast prose-code:text-accent prose-blockquote:text-muted-contrast prose-li:text-muted-contrast">
						{@html preview}
					</div>
				{:else}
					<p class="text-muted-contrast text-xs italic select-none">Preview will appear here…</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
