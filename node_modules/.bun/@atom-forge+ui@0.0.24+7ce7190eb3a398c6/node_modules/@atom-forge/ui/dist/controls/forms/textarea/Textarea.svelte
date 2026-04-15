<script lang="ts">
	import {twMerge} from 'tailwind-merge';
	import type {ClassProp, XOR} from '../../../helpers/types';
	import type {Snippet} from 'svelte';

	// ── Public API (bind:this) ────────────────────────────────────────────────
	export interface TextareaAPI {
		wrapSelection(wrap: string | [string, string], unwrapWhenWrapped?: boolean): void;
		insertAtCursor(text: string): void;
		selectAll(): void;
		focus(at?: 'beginning' | 'end'): void;
	}

	// ── Props ─────────────────────────────────────────────────────────────────
	let {
		value        = $bindable(''),
		dirty        = $bindable(false),
		placeholder,
		disabled     = false,
		invalid      = false,
		rows         = 3,
		maxRows,
		resizable    = false,
		monospace    = false,
		handleTab    = false,
		tabSize      = 2,
		maxLength,
		showCounter  = false,
		compact,
		small,
		class: classes,
		adornment,
		counter,
	}: ClassProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?:       string;
		dirty?:       boolean;
		placeholder?: string;
		disabled?:    boolean;
		invalid?:     boolean;
		rows?:        number;
		maxRows?:     number;
		resizable?:   boolean;
		monospace?:   boolean;
		handleTab?:   boolean;
		tabSize?:     number;
		maxLength?:   number;
		showCounter?: boolean;
		adornment?:   Snippet;
		counter?:     Snippet<[{ count: number; max: number | undefined; words: number; letters: number }]>;
	} = $props();

	// ── Internal state ────────────────────────────────────────────────────────
	let textareaEl = $state<HTMLTextAreaElement | undefined>(undefined);
	const originalValue = $state(value);

	// Dirty tracking
	$effect(() => { dirty = value !== originalValue; });

	// ── Autogrow ──────────────────────────────────────────────────────────────
	const lineHeightPx = $derived(small ? 18 : compact ? 18 : 20);

	function calcMaxHeight(): number | undefined {
		if (!maxRows) return undefined;
		const padY = small || compact ? 8 : 16;
		return maxRows * lineHeightPx + padY;
	}

	$effect(() => {
		const el = textareaEl;
		if (!el) return;
		// trigger on value change
		void value;
		el.style.height = 'auto';
		const maxH = calcMaxHeight();
		el.style.height = (maxH ? Math.min(el.scrollHeight, maxH) : el.scrollHeight) + 'px';
	});

	// ── Counter stats ─────────────────────────────────────────────────────────
	const charCount  = $derived(value.length);
	const wordCount  = $derived(value.trim() === '' ? 0 : value.trim().split(/\s+/).length);
	const letterCount = $derived(value.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, '').length);

	// ── Tab handling ──────────────────────────────────────────────────────────
	function handleKeydown(e: KeyboardEvent) {
		if (!handleTab || e.key !== 'Tab') return;
		e.preventDefault();

		const el = e.currentTarget as HTMLTextAreaElement;
		const start = el.selectionStart;
		const end   = el.selectionEnd;
		const indent = tabSize === 0 ? '\t' : ' '.repeat(tabSize);
		const text   = el.value;

		if (start === end) {
			// no selection — indent/outdent current position
			if (e.shiftKey) {
				const lineStart = text.lastIndexOf('\n', start - 1) + 1;
				const before    = text.slice(lineStart, start);
				const stripped  = tabSize === 0
					? before.replace(/^\t/, '')
					: before.replace(new RegExp(`^ {1,${tabSize}}`), '');
				const removed = before.length - stripped.length;
				if (removed > 0) {
					const next = text.slice(0, lineStart) + stripped + text.slice(start);
					el.value = next;
					el.setSelectionRange(start - removed, start - removed);
					value = next;
				}
			} else {
				const next = text.slice(0, start) + indent + text.slice(end);
				el.value = next;
				el.setSelectionRange(start + indent.length, start + indent.length);
				value = next;
			}
			return;
		}

		// multi-line selection
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const lines = text.slice(lineStart, end).split('\n');

		const processed = lines.map(line => {
			if (e.shiftKey) {
				return tabSize === 0
					? line.replace(/^\t/, '')
					: line.replace(new RegExp(`^ {1,${tabSize}}`), '');
			}
			return indent + line;
		});

		const replaced = processed.join('\n');
		const delta    = replaced.length - (end - lineStart);
		const next     = text.slice(0, lineStart) + replaced + text.slice(end);
		el.value = next;
		el.setSelectionRange(lineStart, end + delta);
		value = next;
	}

	// ── Public API ────────────────────────────────────────────────────────────
	export function wrapSelection(wrap: string | [string, string], unwrapWhenWrapped = false) {
		const el = textareaEl;
		if (!el) return;

		const prefix = Array.isArray(wrap) ? wrap[0] : wrap;
		const suffix = Array.isArray(wrap) ? wrap[1] : wrap;

		const start = el.selectionStart;
		const end   = el.selectionEnd;
		const sel   = el.value.slice(start, end);

		// unwrap if selection is already wrapped
		if (unwrapWhenWrapped && sel.startsWith(prefix) && sel.endsWith(suffix) && sel.length >= prefix.length + suffix.length) {
			const inner = sel.slice(prefix.length, sel.length - suffix.length);
			const next  = el.value.slice(0, start) + inner + el.value.slice(end);
			el.value    = next;
			value       = next;
			el.setSelectionRange(start, start + inner.length);
			el.focus();
			return;
		}

		// also check if the characters *around* the selection are the wrap markers
		if (unwrapWhenWrapped
			&& el.value.slice(start - prefix.length, start) === prefix
			&& el.value.slice(end, end + suffix.length) === suffix) {
			const next = el.value.slice(0, start - prefix.length) + sel + el.value.slice(end + suffix.length);
			el.value   = next;
			value      = next;
			el.setSelectionRange(start - prefix.length, end - prefix.length);
			el.focus();
			return;
		}

		const next = el.value.slice(0, start) + prefix + sel + suffix + el.value.slice(end);
		el.value   = next;
		value      = next;
		el.setSelectionRange(start + prefix.length, end + prefix.length);
		el.focus();
	}

	export function insertAtCursor(text: string) {
		const el = textareaEl;
		if (!el) return;
		const pos  = el.selectionStart;
		const next = el.value.slice(0, pos) + text + el.value.slice(pos);
		el.value   = next;
		value      = next;
		el.setSelectionRange(pos + text.length, pos + text.length);
		el.focus();
	}

	export function selectAll() {
		textareaEl?.select();
	}

	export function focus(at: 'beginning' | 'end' = 'beginning') {
		const el = textareaEl;
		if (!el) return;
		el.focus();
		if (at === 'end') {
			el.setSelectionRange(el.value.length, el.value.length);
		}
	}

	// ── Styles ────────────────────────────────────────────────────────────────
	const size = $derived(small ? 'small' : compact ? 'compact' : 'normal');

	const wrapperClass = $derived(twMerge(
		'relative flex flex-col rounded-control border bg-control border-frame transition-colors overflow-hidden',
		size === 'compact' && 'text-xs',
		size === 'small'   && 'text-[12px]',
		disabled && 'cursor-not-allowed bg-muted/50 opacity-70 striped-10',
		invalid  ? 'border-error text-error' : 'border-frame',
		classes,
	));

	const taClass = $derived(twMerge(
		'w-full bg-transparent border-none focus:ring-0 disabled:cursor-not-allowed text-canvas-contrast placeholder:text-muted-contrast leading-5',
		size === 'normal'  && 'px-3 py-2 text-sm',
		size === 'compact' && 'px-2 py-1 text-xs',
		size === 'small'   && 'px-2 py-1 text-[12px]',
		monospace && 'font-mono',
		!resizable && 'resize-none',
		(showCounter || adornment) && (size === 'normal' ? 'pb-7' : 'pb-6'),
	));

	const minHeightStyle = $derived(() => {
		const padY = size === 'normal' ? 16 : 8;
		return `min-height: ${rows * lineHeightPx + padY}px;`;
	});
</script>

<div class={wrapperClass}>

	<div class="relative flex-1">
		<textarea
			bind:this={textareaEl}
			bind:value
			class={taClass}
			style={minHeightStyle()}
			{placeholder}
			{disabled}
			maxlength={maxLength}
			onkeydown={handleKeydown}
		></textarea>

		<!-- adornment / counter (bottom-right corner) -->
		{#if adornment || showCounter}
			<div class="absolute bottom-2 right-2 flex items-center gap-2">
				{#if showCounter}
					<div class="pointer-events-none">
						{#if counter}
							{@render counter({ count: charCount, max: maxLength, words: wordCount, letters: letterCount })}
						{:else}
							<span class={twMerge(
								'text-muted-contrast tabular-nums',
								size === 'normal' ? 'text-xs' : 'text-[10px]',
								maxLength && charCount >= maxLength && 'text-error',
							)}>
								{charCount}{#if maxLength}<span class="opacity-50">/{maxLength}</span>{/if}
							</span>
						{/if}
					</div>
				{/if}
				{#if adornment}
					<div>
						{@render adornment()}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
