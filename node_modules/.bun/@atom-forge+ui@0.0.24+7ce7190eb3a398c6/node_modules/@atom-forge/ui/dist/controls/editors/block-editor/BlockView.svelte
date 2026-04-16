<script lang="ts">
	import type {Component} from 'svelte';
	import {X, Eye} from 'lucide-svelte';
	import {Card} from '../../display/card';
	import {ProsePage} from '../../content/prose';
	import type {Block} from './types.js';

	let {
		blocks,
		previewComponents,
	}: {
		blocks: Block[];
		previewComponents: Record<string, Component<any>>;
	} = $props();

</script>

<Card class="max-h-[90vh] overflow-y-auto p-4">
	<ProsePage>
		{#each blocks as block (block.id)}
			{@const C = previewComponents[block.type]}
			{#if C}
				<C data={block.data}/>
			{:else}
				<p class="text-xs text-muted-contrast italic">No preview available for block type "{block.type}"</p>
			{/if}
		{/each}

		{#if blocks.length === 0}
			<p class="text-center text-sm text-muted-contrast py-8">Nothing to preview yet.</p>
		{/if}
	</ProsePage>
</Card>
