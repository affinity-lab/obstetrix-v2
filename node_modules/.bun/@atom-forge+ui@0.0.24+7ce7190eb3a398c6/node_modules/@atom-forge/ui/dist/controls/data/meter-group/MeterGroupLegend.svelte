<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassProp } from '../../../helpers/types';
	import type { MeterItem } from './MeterGroup.svelte';
	import { twMerge } from 'tailwind-merge';
	import { untrack } from 'svelte';

	let {
		items,
		vertical,
		showValues = true,
		small,
		compact,
		class: classes,
		itemClass,
		swatchClass,
		labelClass,
		valueClass,
		item: itemSnippet,
		value: valueSnippet,
		onitemclick,
	}: ClassProp & {
		items: MeterItem[];
		vertical?: boolean;
		showValues?: boolean;
		small?: boolean;
		compact?: boolean;
		itemClass?: string;
		swatchClass?: string;
		labelClass?: string;
		valueClass?: string;
		item?: Snippet<[MeterItem]>;
		value?: Snippet<[MeterItem]>;
		onitemclick?: (item: MeterItem) => void;
	} = $props();

	const size = untrack(() => (small ? 'small' : compact ? 'compact' : 'normal'));
	const isVertical = untrack(() => vertical);

	const listClass = twMerge(
		isVertical ? 'flex flex-col' : 'flex flex-wrap',
		size === 'normal' && (isVertical ? 'gap-2' : 'gap-x-4 gap-y-2'),
		size === 'compact' && (isVertical ? 'gap-1.5' : 'gap-x-3 gap-y-1.5'),
		size === 'small' && (isVertical ? 'gap-1' : 'gap-x-2 gap-y-1'),
	);

	const itemGap = size === 'normal' ? 'gap-2' : size === 'compact' ? 'gap-1.5' : 'gap-1';
	const swatchSize =
		size === 'normal' ? 'w-3 h-3' : size === 'compact' ? 'w-2.5 h-2.5' : 'w-2 h-2';
	const labelSize = size === 'normal' ? 'text-sm' : 'text-xs';
	const valueSize = size === 'normal' ? 'text-xs' : 'text-[10px]';
</script>

<ul class={twMerge(listClass, classes)}>
	{#each items as meterItem}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<li
			class={twMerge('flex items-center', itemGap, onitemclick && 'cursor-pointer', itemClass)}
			onclick={() => onitemclick?.(meterItem)}
		>
			{#if itemSnippet}
				{@render itemSnippet(meterItem)}
			{:else}
				<span
					aria-hidden="true"
					style:background-color={meterItem.color}
					class={twMerge('inline-block rounded-fine shrink-0', swatchSize, swatchClass)}
				></span>
				<span class={twMerge('text-canvas-contrast', labelSize, labelClass)}>{meterItem.label}</span>
				{#if showValues}
					{#if valueSnippet}
						{@render valueSnippet(meterItem)}
					{:else}
						<span
							class={twMerge(
								'text-muted-contrast font-medium tabular-nums',
								vertical && 'ml-auto',
								valueSize,
								valueClass,
							)}>{meterItem.value}</span
						>
					{/if}
				{/if}
			{/if}
		</li>
	{/each}
</ul>
