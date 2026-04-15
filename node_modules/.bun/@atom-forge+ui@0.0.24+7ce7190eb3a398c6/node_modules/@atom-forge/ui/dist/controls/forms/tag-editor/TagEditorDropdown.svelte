<script lang="ts">
	import type {Snippet} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import {Plus} from 'lucide-svelte';
	import {Icon} from '../../general/icon';
	import SelectPopup, {type FlatItem} from '../../../helpers/SelectPopup.svelte';
	import {getPopupManager} from '../../overlays/popup';

	type SharedState = { items: FlatItem[]; query: string };

	let {
		sharedState,
		allowNew,
		onAdd,
		option: optionSnippet,
	}: {
		sharedState: SharedState;
		allowNew: boolean;
		onAdd: (tag: string) => void;
		option?: Snippet<[string, boolean]>;
	} = $props();

	const popupManager = getPopupManager();
	let popupEl = $state<ReturnType<typeof SelectPopup>>();

	function select(item: FlatItem) {
		onAdd(String(item.value));
		sharedState.query = '';
	}
</script>

<svelte:window onkeydown={e => {
	if (e.key === 'ArrowDown') { e.preventDefault(); popupEl?.moveDown(); }
	else if (e.key === 'ArrowUp') { e.preventDefault(); popupEl?.moveUp(); }
	else if (e.key === 'Enter') {
		e.preventDefault();
		if ((popupEl?.getHighlighted() ?? -1) >= 0) {
			popupEl?.confirm();
		} else if (allowNew && sharedState.query.trim()) {
			onAdd(sharedState.query.trim());
			sharedState.query = '';
		}
	}
	else if (e.key === 'Escape') { popupManager.close(); }
}}/>

<SelectPopup
	bind:this={popupEl}
	items={sharedState.items}
	searchable={false}
	autoFocus={false}
	onSelect={select}
	close={() => popupManager.close()}
>
	{#snippet itemRenderer(data, isHighlighted)}
		{#if !data.isNew && optionSnippet}
			{@render optionSnippet(String(data.label), isHighlighted)}
		{:else}
			<div class={twMerge(
				'flex items-center gap-2 px-3 py-2 rounded-surface text-sm transition-colors',
				isHighlighted ? 'bg-accent text-accent-contrast' : 'hover:bg-secondary',
			)}>
				{#if data.isNew}
					<Icon icon={Plus} pxSize={13} class="shrink-0 opacity-70"/>
					<span>Add <span class="font-medium">'{data.label}'</span></span>
				{:else}
					<span class="flex-1">{data.label}</span>
				{/if}
			</div>
		{/if}
	{/snippet}
</SelectPopup>
