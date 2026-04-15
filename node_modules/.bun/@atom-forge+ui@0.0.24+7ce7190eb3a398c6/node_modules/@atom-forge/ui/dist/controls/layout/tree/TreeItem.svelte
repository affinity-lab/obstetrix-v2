<script lang="ts">
	import {ChevronRight} from 'lucide-svelte';
	import {getContext, type Snippet} from 'svelte';
	import {slide} from 'svelte/transition';
	import {twMerge} from 'tailwind-merge';
	import {Icon} from "../../general/icon";
	import TreeItem from './TreeItem.svelte';
	import type {TreeNode} from './types';

	let {
		node,
		level = 0,
	}: {
		node: TreeNode
		level?: number
	} = $props();

	const treeview = getContext<{
		toggleExpanded: (id: string) => void;
		isExpanded: (id: string) => boolean;
		row?: Snippet<[TreeNode]>;
		onNodeClick?: (node: TreeNode) => void;
		isSelected: (id: string) => boolean;
	}>('treeview');

	const isExpanded = $derived(treeview.isExpanded(node.id));
	const hasChildren = $derived(node.children && node.children.length > 0);
	const isSelected = $derived(treeview.isSelected(node.id));

	const rowClass = $derived(twMerge(
		'flex items-center p-1.5 rounded-md cursor-pointer select-none',
		isSelected ? 'bg-secondary' : 'hover:bg-secondary/50',
	));

	function handleClick() {
		if (hasChildren) {
			treeview.toggleExpanded(node.id);
		}
		if (treeview.onNodeClick) {
			treeview.onNodeClick(node);
		}
	}
</script>

<div class="relative">
	<div
		role="button"
		tabindex="0"
		class={rowClass}
		style:margin-left="{level * 1.25}rem"
		onclick={handleClick}
		onkeydown={(e) => e.key === 'Enter' && handleClick()}
	>
		<div class="w-6 shrink-0 text-left items-center flex flex-row">
			{#if hasChildren}
				<span class="inline-block aspect-square items-center transition-transform duration-200" class:rotate-90={isExpanded}>
					<Icon icon={ChevronRight} size="4" class="text-muted-contrast"/>
				</span>
			{:else}
				<div class="inline-block h-2 w-2 ml-1.5 rounded-full bg-muted"></div>
			{/if}
		</div>
		{#if treeview.row}
			{@render treeview.row(node)}
		{:else}
			{#if node.icon}
				<Icon icon={node.icon} size="4" class="mr-2 text-muted-contrast"/>
			{/if}
			<span class="truncate text-canvas-contrast">{node.label}</span>
		{/if}
	</div>

	{#if hasChildren && isExpanded}
		<div class="relative" transition:slide={{ duration: 150 }}>
			<div class="absolute top-1 bottom-1 w-px bg-frame rounded-full" style:left="{level * 1.25 + .75}rem"></div>
			{#each node.children as childNode}
				<TreeItem node={childNode} level={level + 1}/>
			{/each}
		</div>
	{/if}
</div>
