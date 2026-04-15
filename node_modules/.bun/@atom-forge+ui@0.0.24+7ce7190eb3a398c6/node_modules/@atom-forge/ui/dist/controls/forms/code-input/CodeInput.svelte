<script lang="ts">
	import {twMerge} from 'tailwind-merge';
	import type {AnyProp, ClassProp, XOR} from '../../../helpers/types';
	import {untrack} from 'svelte';

	type CharacterSet = 'any' | 'numeric' | 'alpha' | 'alphanumeric' | ((char: string) => boolean);

	let {
		value        = $bindable(''),
		layout       = 6,
		separator    = '-',
		characterSet = 'any',
		placeholder  = '',
		prefix       = '',
		disabled     = false,
		uppercase    = false,
		compact,
		small,
		onComplete,
		class: classes,
		...props
	}: ClassProp & AnyProp
		& XOR<{ compact: true }, { small: true }, {}>
		& {
		value?:        string;
		layout?:       number | number[];
		separator?:    string;
		characterSet?: CharacterSet;
		placeholder?:  string;
		prefix?:       string;
		disabled?:     boolean;
		uppercase?:    boolean;
		onComplete?:   (value: string) => void;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	// ── layout computation ────────────────────────────────────────────────────

	const groups: number[] = untrack(() =>
		Array.isArray(layout) ? layout : [layout]
	);
	const totalLength = untrack(() => groups.reduce((a, b) => a + b, 0));

	// boxes[i] = group index
	const boxes: number[] = untrack(() => {
		const result: number[] = [];
		groups.forEach((count, gi) => {
			for (let i = 0; i < count; i++) result.push(gi);
		});
		return result;
	});

	// prefix chars normalized & clamped to totalLength
	const prefixChars: string[] = untrack(() => {
		const p = (uppercase ? prefix.toUpperCase() : prefix).split('');
		while (p.length < totalLength) p.push('');
		return p.slice(0, totalLength);
	});
	// first editable box index (after prefix)
	const editStart = untrack(() => prefixChars.findLastIndex(c => c !== '') + 1);

	// ── state ─────────────────────────────────────────────────────────────────

	let inputEl    = $state<HTMLInputElement | undefined>(undefined);
	let focused    = $state(false);
	let focusedIdx = $state(editStart);

	// user-editable chars derived from value
	const editableLength = $derived(totalLength - editStart);

	const chars = $derived.by(() => {
		// full chars = prefix + user value
		const userArr = value.split('');
		while (userArr.length < editableLength) userArr.push('');
		return [...prefixChars.slice(0, editStart), ...userArr.slice(0, editableLength)];
	});

	// ── character validation ──────────────────────────────────────────────────

	function isAllowed(char: string): boolean {
		if (typeof characterSet === 'function') return characterSet(char);
		if (characterSet === 'numeric')      return /^\d$/.test(char);
		if (characterSet === 'alpha')        return /^[a-zA-Z]$/.test(char);
		if (characterSet === 'alphanumeric') return /^[a-zA-Z0-9]$/.test(char);
		return true;
	}

	function norm(char: string): string {
		return uppercase ? char.toUpperCase() : char;
	}

	// ── sync editable chars → value prop ──────────────────────────────────────

	function setChar(idx: number, char: string) {
		if (idx < editStart) return; // never mutate prefix slots
		const arr = chars.slice();
		arr[idx] = char;
		const newValue = arr.slice(editStart).join('');
		value = newValue;
		if (arr.slice(editStart).every(c => c !== '') && onComplete) onComplete(newValue);
	}

	function focusBox(idx: number) {
		focusedIdx = Math.max(editStart, Math.min(totalLength - 1, idx));
		// offset into the hidden input (which only sees editable chars)
		const editIdx = focusedIdx - editStart;
		inputEl?.setSelectionRange(editIdx, editIdx + 1);
	}

	// ── keyboard ─────────────────────────────────────────────────────────────

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			focusBox(focusedIdx + 1);
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			focusBox(focusedIdx - 1);
		} else if (e.key === 'Backspace' || e.key === 'Delete') {
			e.preventDefault();
			if (chars[focusedIdx] !== '') {
				setChar(focusedIdx, '');
			} else if (focusedIdx > editStart) {
				setChar(focusedIdx - 1, '');
				focusBox(focusedIdx - 1);
			}
		} else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
			e.preventDefault();
			const c = norm(e.key);
			if (!isAllowed(c)) return;
			setChar(focusedIdx, c);
			if (focusedIdx < totalLength - 1) focusBox(focusedIdx + 1);
		}
	}

	function onPaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text') ?? '';
		// Strip prefix from pasted text if it starts with it
		const prefixStr = prefixChars.slice(0, editStart).join('');
		const stripped = text.startsWith(prefixStr) ? text.slice(prefixStr.length) : text;
		const valid = stripped.split('').map(norm).filter(isAllowed);
		const arr = chars.slice();
		let idx = focusedIdx;
		for (const c of valid) {
			if (idx >= totalLength) break;
			arr[idx++] = c;
		}
		const newValue = arr.slice(editStart).join('');
		value = newValue;
		focusBox(Math.min(idx, totalLength - 1));
		if (arr.slice(editStart).every(c => c !== '') && onComplete) onComplete(newValue);
	}

	function onInputFocus() {
		focused = true;
		focusBox(focusedIdx);
	}

	// ── styles ────────────────────────────────────────────────────────────────

	const boxSize = untrack(() => ({
		normal:  'w-10 h-12 text-base',
		compact: 'w-8  h-10 text-sm',
		small:   'w-6  h-8  text-xs',
	}[size]));

	const sepClass = untrack(() => twMerge(
		'text-muted-contrast font-mono select-none px-0.5',
		size === 'normal'  && 'text-sm',
		size === 'compact' && 'text-xs',
		size === 'small'   && 'text-[10px]',
	));

	const boxClass = (idx: number) => twMerge(
		'relative flex items-center justify-center',
		'rounded-control border font-mono font-semibold',
		'bg-control border-frame text-canvas-contrast transition-colors select-none',
		boxSize,
		// prefix boxes — visually dimmed, not interactive
		idx < editStart && 'opacity-60 cursor-default',
		// editable focused box
		focused && focusedIdx === idx && idx >= editStart
			? 'border-accent ring-2 ring-accent/40 z-10'
			: 'border-frame',
		disabled && 'opacity-50 cursor-not-allowed',
	);

	const placeholderClass = 'text-muted-contrast/40 pointer-events-none';
</script>

<div class={twMerge('inline-flex items-center gap-1.5', classes)} {...props}>
	<!-- Hidden input only covers the editable portion -->
	<input
		bind:this={inputEl}
		type="text"
		inputmode={characterSet === 'numeric' ? 'numeric' : 'text'}
		class="fixed opacity-0 pointer-events-none w-0 h-0 overflow-hidden"
		tabindex="-1"
		{value}
		{disabled}
		maxlength={editableLength}
		autocomplete="one-time-code"
		aria-label="Code input"
		onfocus={onInputFocus}
		onblur={() => focused = false}
		onkeydown={onKeydown}
		onpaste={onPaste}
	/>

	{#each boxes as groupIdx, idx}
		{@const isFirstInGroup = idx === 0 || boxes[idx - 1] !== groupIdx}
		{@const isNotFirst = idx > 0}

		{#if isNotFirst && isFirstInGroup}
			<span class={sepClass}>{separator}</span>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			role="presentation"
			class={boxClass(idx)}
			onclick={() => {
				if (!disabled && idx >= editStart) { focusBox(idx); inputEl?.focus({ preventScroll: true }); }
			}}
		>
			{#if chars[idx]}
				<span>{chars[idx]}</span>
			{:else if placeholder}
				<span class={placeholderClass}>{placeholder}</span>
			{:else if focused && focusedIdx === idx && idx >= editStart}
				<span class="w-px h-5 bg-accent animate-pulse"></span>
			{/if}
		</div>
	{/each}
</div>

