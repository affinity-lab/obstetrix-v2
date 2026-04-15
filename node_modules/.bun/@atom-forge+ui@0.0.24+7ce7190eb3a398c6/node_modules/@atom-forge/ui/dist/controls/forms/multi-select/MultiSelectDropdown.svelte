<script lang="ts">
	import type {Snippet} from 'svelte';
	import {untrack} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import SelectPopup, {type FlatItem} from '../../../helpers/SelectPopup.svelte';
	import {getPopupManager} from '../../overlays/popup';
	import type {SelectOption, SelectOptionsSource} from '../select/Select.svelte';

	let {
		options,
		initialValue,
		max,
		searchable,
		onToggle,
		optionSnippet,
	}: {
		options: SelectOptionsSource; // Frissített típus
		initialValue: (string | number)[];
		max?: number;
		searchable?: boolean;
		onToggle: (opt: SelectOption, newValues: (string | number)[]) => void;
		optionSnippet?: Snippet<[SelectOption, boolean]>;
	} = $props();

	const popupManager = getPopupManager();

	let selected = $state<(string | number)[]>(untrack(() => [...initialValue]));
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
			console.warn("MultiSelectDropdown received an unexpected options type:", options);
			items = [];
		}
	});

	function toggle(opt: SelectOption) {
		const idx = selected.indexOf(opt.value);
		if (idx >= 0) {
			selected = selected.filter(v => v !== opt.value);
		} else {
			if (max !== undefined && selected.length >= max) return;
			selected = [...selected, opt.value];
		}
		onToggle(opt, selected);
	}
</script>

<SelectPopup
	{items}
	{searchable}
	bind:query
	onSelect={({data}) => toggle(data)}
	close={() => popupManager.close()}
>
	{#snippet itemRenderer(data, isHighlighted)}
		{@const isSelected = selected.includes(data.value)}
		{@const maxReached = max !== undefined && selected.length >= max && !isSelected}
		{#if optionSnippet}
			{@render optionSnippet(data, isHighlighted)}
		{:else}
			<div class={twMerge(
				'flex items-center px-3 py-2 rounded-surface text-sm transition-colors',
				isHighlighted && !maxReached ? 'bg-accent text-accent-contrast' : 'hover:bg-secondary',
				maxReached && 'opacity-40 cursor-not-allowed',
			)}>
				<span class="flex-1">{data.label}</span>
				{#if isSelected}
					<span class="text-xs ml-2 shrink-0 opacity-60">✓</span>
				{/if}
			</div>
		{/if}
	{/snippet}
</SelectPopup>
