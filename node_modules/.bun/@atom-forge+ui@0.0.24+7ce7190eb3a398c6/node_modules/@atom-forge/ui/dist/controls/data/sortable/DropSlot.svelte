<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		atIndex,
		insertIndex,
		draggingItem,
		orientation,
		dropIndicatorSnippet,
	}: {
		atIndex: number;
		insertIndex: number;
		draggingItem: any;
		orientation: 'vertical' | 'horizontal' | 'grid';
		dropIndicatorSnippet?: Snippet<[any]>;
	} = $props();
</script>

{#if insertIndex === atIndex}
	{#if dropIndicatorSnippet}
		{@render dropIndicatorSnippet(draggingItem)}
	{:else if orientation === 'vertical'}
		<div class="h-4 self-stretch rounded-full border border-dashed border-accent/20 bg-accent/10"></div>
	{:else}
		<div class="w-4 self-stretch rounded-full border border-dashed border-accent/20 bg-accent/10"></div>
	{/if}
{/if}
