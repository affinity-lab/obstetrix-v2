<script lang="ts">
	import { getBlockAPI } from '../context.js';
	import MarkdownEditor from '../../markdown-editor/MarkdownEditor.svelte';

	let { id, data }: { id: string; data: { text: string } | null } = $props();

	const api     = getBlockAPI();
	let editorRef = $state<ReturnType<typeof MarkdownEditor> | undefined>(undefined);

	$effect(() => {
		api.register(id, {
			focus(dir) { editorRef?.focus(dir); },
			focusAt(pos) { editorRef?.focusAt(pos); },
		});
		return () => api.unregister(id);
	});
</script>

<MarkdownEditor
	bind:this={editorRef}
	value={data?.text ?? ''}
	onchange={(v) => api.updateData(id, { text: v })}
	onnavigate={(dir) => dir === 'next' ? api.focusNext(id) : api.focusPrev(id)}
	onsplit={(before, after) => {
		api.updateData(id, { text: before });
		api.split(id, [{ type: api.joinable, data: { text: after } }]);
	}}
	onjoinprev={() => {
		const prev = api.getPrevBlock(id);
		if (!prev) return;
		if (prev.type !== api.joinable) return;
		const joinPos = prev.data?.text?.length ?? 0;
		api.updateData(prev.id, { text: (prev.data?.text ?? '') + (data?.text ?? '') });
		api.joinWithPrev(id, joinPos);
	}}
	onjoinnext={() => {
		const next = api.getNextBlock(id);
		if (!next) return;
		if (next.type !== api.joinable) return;
		const joinPos = data?.text?.length ?? 0;
		api.updateData(next.id, { text: (data?.text ?? '') + (next.data?.text ?? '') });
		api.joinWithNext(id, joinPos);
	}}
/>
