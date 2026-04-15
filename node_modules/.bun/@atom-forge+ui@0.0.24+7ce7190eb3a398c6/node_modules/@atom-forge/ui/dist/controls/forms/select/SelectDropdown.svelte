<script lang="ts">
	import type {Snippet} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import SelectPopup, {type FlatItem} from '../../../helpers/SelectPopup.svelte';
	import {getPopupManager} from '../../overlays/popup';
	import type {SelectOption, SelectOptionsSource} from './Select.svelte';

	let {
		options,
		value,
		searchable,
		onSelect,
		optionSnippet,
	}: {
		options: SelectOptionsSource; // Frissített típus
		value?: string | number;
		searchable?: boolean;
		onSelect: (option: SelectOption) => void;
		optionSnippet?: Snippet<[SelectOption, boolean]>;
	} = $props();

	const popupManager = getPopupManager();

	let query = $state('');
	let items = $state<FlatItem[] | Promise<FlatItem[]>>([]);

	$effect(() => {
		const q = query;
		if (Array.isArray(options)) {
			// Case 1: options is SelectOption[]
			items = options
				.filter(o => !q || String(o.label).toLowerCase().includes(q.toLowerCase()))
				.map(o => ({value: o.value, data: o}));
		} else if (typeof options === 'object' && options !== null && 'search' in options) {
			// Case 2: options is { search: ..., get: ... }
			items = options.search(q).then(result => result.map(o => ({value: o.value, data: o})));
		} else {
			// Fallback for unexpected types (should not happen with strict typing)
			console.warn("SelectDropdown received an unexpected options type:", options);
			items = [];
		}
	});
</script>

<SelectPopup
	{items}
	{searchable}
	bind:query
	onSelect={({data}) => { onSelect(data); popupManager.close(); }}
	close={() => popupManager.close()}
>
	{#snippet itemRenderer(data, isHighlighted)}
		{#if optionSnippet}
			{@render optionSnippet(data, isHighlighted)}
		{:else}
			<div class={twMerge(
				'flex items-center px-3 py-2 rounded-surface text-sm transition-colors',
				isHighlighted ? 'bg-accent text-accent-contrast' : 'hover:bg-secondary',
			)}>
				<span class="flex-1">{data.label}</span>
				{#if data.value === value}
					<span class="text-xs ml-2 shrink-0 opacity-60">✓</span>
				{/if}
			</div>
		{/if}
	{/snippet}
</SelectPopup>
