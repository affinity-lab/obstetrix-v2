<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AnyProp, ClassProp } from '../../../helpers/types';
	import { twMerge } from 'tailwind-merge';
	import { untrack } from 'svelte';

	export type MeterItem = {
		id: string;
		label: string;
		value: number;
		color: string;
	};

	let {
		items,
		max,
		vertical,
		small,
		compact,
		class: classes,
		segmentClass,
		segment,
		onsegmentclick,
		...props
	}: ClassProp & AnyProp & {
		items: MeterItem[];
		max?: number;
		vertical?: boolean;
		small?: boolean;
		compact?: boolean;
		segmentClass?: string;
		segment?: Snippet<[MeterItem]>;
		onsegmentclick?: (item: MeterItem) => void;
	} = $props();

	const size = untrack(() => (small ? 'small' : compact ? 'compact' : 'normal'));
	const isVertical = untrack(() => vertical);

	const total = $derived(max ?? items.reduce((sum, item) => sum + item.value, 0));
	const filled = $derived(items.reduce((sum, item) => sum + item.value, 0));
	const remaining = $derived(max !== undefined ? Math.max(0, max - filled) : 0);

	// horizontal: size = height; vertical: size = width
	const sizeClass = isVertical
		? { normal: 'w-4', compact: 'w-3', small: 'w-2' }[size]
		: { normal: 'h-4', compact: 'h-3', small: 'h-2' }[size];
</script>

<div
	role="meter"
	aria-valuemin={0}
	aria-valuemax={total}
	aria-valuenow={filled}
	class={twMerge(
		'overflow-hidden rounded-full',
		vertical ? 'flex flex-col' : 'flex w-full',
		sizeClass,
		classes,
	)}
	{...props}
>
	{#each items as item}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			style:flex={item.value}
			style:background-color={item.color}
			class={twMerge(
				vertical ? 'w-full' : 'h-full',
				onsegmentclick && 'cursor-pointer',
				segmentClass,
			)}
			title={item.label}
			onclick={() => onsegmentclick?.(item)}
		>
			{#if segment}
				{@render segment(item)}
			{/if}
		</div>
	{/each}
	{#if remaining > 0}
		<div style:flex={remaining} class={twMerge(vertical ? 'w-full' : 'h-full', 'bg-secondary')}></div>
	{/if}
</div>
