<script lang="ts">
	import { untrack } from 'svelte';
	import { getBlockAPI } from '../context.js';
	import type { BlockController } from '../types.js';

	let { id, data }: { id: string; data: { text: string } | null } = $props();

	const api = getBlockAPI();

	let text = $state(untrack(() => data?.text ?? ''));
	let el = $state<HTMLTextAreaElement | undefined>(undefined);

	// Sync external data changes (undo/redo and join merges)
	$effect(() => {
		const incoming = data?.text;
		if (incoming !== undefined && incoming !== untrack(() => text)) {
			text = incoming;
		}
	});

	// Register focus controller
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

	// Auto-grow action
	function autogrow(node: HTMLTextAreaElement) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		}
		resize();
		node.addEventListener('input', resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	function handleInput() {
		api.updateData(id, { text });
	}

	function handleKeydown(e: KeyboardEvent) {
		const target = e.currentTarget as HTMLTextAreaElement;
		const atStart = target.selectionStart === 0 && target.selectionEnd === 0;
		const atEnd = target.selectionStart === target.value.length && target.selectionEnd === target.value.length;

		if (e.key === 'Enter' && e.shiftKey) {
			// Shift+Enter → split block at cursor
			e.preventDefault();
			const pos = target.selectionStart;
			const before = text.slice(0, pos);
			const after = text.slice(target.selectionEnd);
			text = before;
			api.updateData(id, { text: before });
			api.split(id, [{ type: api.joinable || 'text', data: { text: after } }]);

		} else if (e.key === 'Backspace' && atStart) {
			// Backspace at start → join with previous block
			e.preventDefault();
			const prev = api.getPrevBlock(id);
			if (!prev) return;

			if (text === '' || prev.type !== api.joinable) {
				api.joinWithPrev(id);
			} else {
				const prevText: string = prev.data?.text ?? '';
				api.updateData(prev.id, { text: prevText + text });
				api.joinWithPrev(id);
			}

		} else if (e.key === 'Delete' && atEnd) {
			// Delete at end → join next block into this one
			e.preventDefault();
			const next = api.getNextBlock(id);
			if (!next) return;

			if (next.type !== api.joinable) {
				api.joinWithNext(next.id);
			} else {
				const nextText: string = next.data?.text ?? '';
				api.updateData(id, { text: text + nextText });
				api.joinWithNext(next.id);
			}

		} else if (e.key === 'ArrowUp' && atStart) {
			e.preventDefault();
			api.focusPrev(id);

		} else if (e.key === 'ArrowDown' && atEnd) {
			e.preventDefault();
			api.focusNext(id);
		}
	}
</script>

<div class="group relative">
	<textarea
		bind:this={el}
		bind:value={text}
		use:autogrow
		class="w-full bg-transparent border-none outline-none resize-none text-canvas-contrast placeholder:text-muted-contrast text-sm leading-relaxed py-2 px-1 min-h-[2rem] block"
		placeholder="Write something..."
		rows={1}
		oninput={handleInput}
		onkeydown={handleKeydown}
	></textarea>
</div>
