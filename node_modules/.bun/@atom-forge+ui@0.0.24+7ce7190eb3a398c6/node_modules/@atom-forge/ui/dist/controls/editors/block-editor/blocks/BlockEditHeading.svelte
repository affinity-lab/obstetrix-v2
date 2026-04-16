<script lang="ts">
	import {untrack} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import {getBlockAPI} from '../context.js';
	import type {BlockController} from '../types.js';
	import {as} from '../../../../helpers/as';

	let {id, data}: { id: string; data: { text: string; level: 1 | 2 | 3 } | null } = $props();

	const api = getBlockAPI();

	let text = $state(untrack(() => data?.text ?? ''));
	let level = $state<1 | 2 | 3>(untrack(() => data?.level ?? 1));
	let el = $state<HTMLInputElement | undefined>(undefined);

	// Sync external changes (undo/redo)
	$effect(() => {
		const t = data?.text;
		const l = data?.level;
		untrack(() => {
			if (t !== undefined && t !== text) text = t;
			if (l !== undefined && l !== level) level = l;
		});
	});

	$effect(() => {
		const controller: BlockController = {
			focus(direction) {
				if (!el) return;
				el.focus();
				const pos = direction === 'end' ? el.value.length : 0;
				el.setSelectionRange(pos, pos);
			},
		};
		api.register(id, controller);
		return () => api.unregister(id);
	});

	function sync() {
		api.updateData(id, {text, level});
	}

	function setLevel(l: 1 | 2 | 3) {
		level = l;
		api.updateData(id, {text, level: l});
	}

	function handleKeydown(e: KeyboardEvent) {
		const target = e.currentTarget as HTMLInputElement;
		const atStart = target.selectionStart === 0 && target.selectionEnd === 0;
		const atEnd = target.selectionStart === target.value.length && target.selectionEnd === target.value.length;

		if (e.key === 'Enter') {
			e.preventDefault();
			const pos = target.selectionStart ?? text.length;
			const before = text.slice(0, pos);
			const after = text.slice(target.selectionEnd ?? pos);
			text = before;
			api.updateData(id, {text: before, level});
			api.split(id, [{type: api.joinable || 'text', data: {text: after}}]);

		} else if (e.key === 'Backspace' && atStart && text === '') {
			e.preventDefault();
			api.joinWithPrev(id);

		} else if (e.key === 'Delete' && atEnd) {
			e.preventDefault();
			const next = api.getNextBlock(id);
			if (next) api.joinWithNext(next.id);

		} else if (e.key === 'ArrowUp' && atStart) {
			e.preventDefault();
			api.focusPrev(id);

		} else if (e.key === 'ArrowDown' && atEnd) {
			e.preventDefault();
			api.focusNext(id);
		}
	}

	const inputClass = $derived(
		level === 1 ? 'text-2xl font-bold' :
			level === 2 ? 'text-xl font-semibold' :
				'text-lg font-medium'
	);
</script>

<div>
	<input
		bind:this={el}
		bind:value={text}
		type="text"
		placeholder="Heading..."
		class="w-full bg-transparent border-none outline-none text-canvas-contrast placeholder:text-muted-contrast py-2 px-1 {inputClass}"
		oninput={sync}
		onkeydown={handleKeydown}
	/>

	<!-- Level toolbar -->
	<div class="flex gap-1 px-1 pb-1.5 pt-1 border-t border-frame">
		{#each [1, 2, 3] as l (l)}
			<button
				class={twMerge(
					'w-7 h-5 text-[10px] font-bold rounded transition-colors cursor-pointer',
					level === l ? 'bg-secondary text-canvas-contrast' : 'text-muted-contrast hover:text-canvas-contrast'
				)}
				onclick={() => setLevel(as<1|2|3>(l))}
			>H{l}</button>
		{/each}
	</div>
</div>
