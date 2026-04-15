<script lang="ts">
	import type {Snippet} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import SelectPopup, {type GroupedItems} from '../../../helpers/SelectPopup.svelte';
	import {Icon} from '../../general/icon';
	import type {CommandItem} from './command.svelte';

	type ItemsSource = CommandItem[] | ((query: string) => Promise<CommandItem[]>);

	let {
		items = [],
		placeholder = 'Search commands...',
		close = () => {},
		option: optionSnippet,
	}: {
		items?: ItemsSource;
		placeholder?: string;
		close?: () => void;
		option?: Snippet<[CommandItem, boolean]>;
	} = $props();

	let query = $state('');

	function buildGrouped(cmds: CommandItem[]): GroupedItems {
		const map = new Map<string, CommandItem[]>();
		for (const item of cmds) {
			const g = item.group ?? '';
			if (!map.has(g)) map.set(g, []);
			map.get(g)!.push(item);
		}
		return [...map.entries()].map(([group, groupItems]) => ({
			group,
			items: groupItems.map(i => ({value: i.id, data: i})),
		}));
	}

	const popupItems = $derived.by(() => {
		const q = query.toLowerCase();
		if (typeof items !== 'function') {
			const filtered = q
				? items.filter(c =>
					c.label.toLowerCase().includes(q) ||
					c.group?.toLowerCase().includes(q) ||
					c.description?.toLowerCase().includes(q) ||
					c.keywords?.some(k => k.toLowerCase().includes(q))
				)
				: items;
			return buildGrouped(filtered);
		}
		return (items as (q: string) => Promise<CommandItem[]>)(query).then(buildGrouped);
	});
</script>

<SelectPopup
	items={popupItems}
	grouped
	bind:query
	{placeholder}
	onSelect={({data}) => { data.onSelect(data); close(); }}
	{close}
	class="w-[520px] max-w-[calc(100vw-1rem)]"
>
	{#snippet itemRenderer(data, isHighlighted)}
		{#if optionSnippet}
			{@render optionSnippet(data, isHighlighted)}
		{:else}
			<div class={twMerge(
				'flex items-center gap-3 px-3 py-2.5 rounded-surface transition-colors',
				isHighlighted ? 'bg-accent text-accent-contrast' : 'hover:bg-secondary',
			)}>
				{#if data.icon}
					<span class="shrink-0 opacity-70"><Icon icon={data.icon} pxSize={16}/></span>
				{/if}
				<span class="flex-1 min-w-0">
					<span class="block text-sm font-medium truncate">{data.label}</span>
					{#if data.description}
						<span class="block text-xs opacity-60 truncate">{data.description}</span>
					{/if}
				</span>
			</div>
		{/if}
	{/snippet}
</SelectPopup>
