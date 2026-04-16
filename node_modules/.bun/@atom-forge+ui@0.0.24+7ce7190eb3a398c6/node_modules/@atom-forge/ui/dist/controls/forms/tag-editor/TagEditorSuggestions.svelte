<script lang="ts">
	import {Card} from '../../display/card';
	import {twMerge} from 'tailwind-merge';

	type SuggestionsState = { items: string[]; activeIndex: number; loading: boolean };

	let {data, onSelect}: {
		data: SuggestionsState;
		onSelect: (item: string) => void;
	} = $props();

	let listEl = $state<HTMLUListElement | undefined>(undefined);

	$effect(() => {
		if (data.activeIndex < 0) return;
		listEl?.children[data.activeIndex]?.scrollIntoView({block: 'nearest'});
	});

	const itemClass = (idx: number) => twMerge(
		'px-3 py-1.5 cursor-pointer text-sm text-canvas-contrast truncate',
		idx === data.activeIndex ? 'bg-accent text-accent-contrast' : 'hover:bg-secondary',
	);
</script>

<Card class="p-0 overflow-hidden">
	<ul bind:this={listEl} class="max-h-48 overflow-y-auto py-1" role="listbox">
		{#if data.loading}
			<li class="px-3 py-2 text-sm text-muted-contrast">Loading…</li>
		{:else}
			{#each data.items as item, idx}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					role="option"
					aria-selected={idx === data.activeIndex}
					class={itemClass(idx)}
					onmousedown={(e) => { e.preventDefault(); onSelect(item); }}
				>{item}</li>
			{/each}
		{/if}
	</ul>
</Card>
