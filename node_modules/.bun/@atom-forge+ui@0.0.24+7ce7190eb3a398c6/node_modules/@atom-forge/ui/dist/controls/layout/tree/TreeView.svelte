<script lang="ts">
	import type {ClassProp} from "../../../index";
	import {setContext, type Snippet, untrack} from 'svelte';
	import {twMerge} from "tailwind-merge";
	import TreeItem from './TreeItem.svelte';
	import type {TreeNode} from './types';

	let {
		data,
		row: _row,
		class: classes,
		onNodeClick: _onNodeClick,
		selectedId,
	}: & ClassProp
		& {
		data: TreeNode[];
		row?: Snippet<[TreeNode]>;
		onNodeClick?: (node: TreeNode) => void;
		selectedId?: string;
	} = $props();

	let expandedItems = $state<Set<string>>(new Set());
	const row = untrack(() => _row);
	const onNodeClick = untrack(() => _onNodeClick);

	function toggleExpanded(id: string) {
		const newSet = new Set(expandedItems);
		if (newSet.has(id)) newSet.delete(id);
		else newSet.add(id);
		expandedItems = newSet;
	}

	setContext('treeview', {
		isExpanded: (id: string) => expandedItems.has(id),
		toggleExpanded,
		row,
		onNodeClick,
		isSelected: (id: string) => selectedId === id,
	});

</script>

<div class={twMerge("w-full text-sm", classes)}>
	{#each data as node}
		<TreeItem {node}/>
	{/each}
</div>
