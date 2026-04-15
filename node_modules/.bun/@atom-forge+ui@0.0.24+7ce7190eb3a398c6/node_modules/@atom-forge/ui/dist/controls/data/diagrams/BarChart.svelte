<script lang="ts">
	import TooltipContent from "./TooltipContent.svelte";
	import type {AnyProp, ClassProp} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";

	type ChartSegment = {
		value: number;
		color?: string;
		label?: string;
	};

	type ChartData = {
		label: string;
		value?: number;
		values?: ChartSegment[];
	};

	type Series = {
		name: string;
		color: string;
	}

	type NormalizedItem = {
		label: string;
		values: { value: number; color?: string; label?: string }[];
	};

	let {
		data,
		series,
		variant = 'grouped',
		showInfo = true,
		class: classes,
		...props
	}: & ClassProp
		& AnyProp
		& {
		data: ChartData[]
		series?: Series[]
		variant?: 'grouped' | 'stacked'
		showInfo?: boolean
	} = $props();

	let hoveredItem = $state<NormalizedItem | null>(null);
	let infoPosition = $state<'left' | 'right'>('left');
	let isVisible = $state(false);
	let hideTimeout: number | null = null;

	const normalizedData = $derived(data.map((item: ChartData) => {
		if (item.value !== undefined) {
			return {
				label: item.label,
				values: [{value: item.value, color: series?.[0]?.color || 'bg-stone-400 dark:bg-stone-500'}]
			};
		}
		return {
			...item,
			values: item.values?.map((v, i) => ({...v, color: v.color || series?.[i]?.color || 'bg-stone-400 dark:bg-stone-500'})) || []
		};
	}));

	const maxValue = $derived.by(() => {
		return variant === 'stacked'
			? Math.max(...normalizedData.map(item => item.values.reduce((sum, s) => sum + s.value, 0)), 0)
			: Math.max(...normalizedData.flatMap(item => item.values.map(s => s.value)), 0);
	});

	const tooltipData = $derived(hoveredItem ? {
		label: hoveredItem.label,
		series: hoveredItem.values.map((v, i) => ({
			name: series?.[i]?.name || `Value ${i + 1}`,
			value: v.value,
			color: series?.[i]?.color || 'var(--color-stone-400)'
		}))
	} : null);

	function handleMouseEnter(item: NormalizedItem, index: number) {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
		hoveredItem = item;
		infoPosition = index < normalizedData.length / 2 ? 'right' : 'left';
		isVisible = true;
	}

	function handleMouseLeave() {
		hideTimeout = window.setTimeout(() => {
			isVisible = false;
		}, 200);
	}
</script>

<div class={twMerge("w-full h-full flex flex-col relative", classes)} {...props}>
	{#if showInfo}
		<div class="absolute top-2 {infoPosition === 'left' ? 'left-2' : 'right-2'} h-auto max-w-[40%] pointer-events-none z-10 transition-opacity duration-200"
		     class:opacity-0={!isVisible}
		>
			{#if tooltipData}
				<TooltipContent data={tooltipData}/>
			{/if}
		</div>
	{/if}

	<div class="w-full h-full flex justify-around items-end gap-4 pt-4">
		{#each normalizedData as item, i}
			<div role="none"
			     class="h-full flex flex-col justify-end items-center w-16 gap-1"
			     onmouseenter={() => handleMouseEnter(normalizedData[i], i)}
			     onmouseleave={handleMouseLeave}
			>
				<div class="w-full grow flex items-end hover:brightness-110 transition-all duration-300">
					{#if variant === 'grouped'}
						<div class="flex w-full h-full items-end gap-0.5">
							{#each item.values as segment}
								<div
									class="grow rounded-control transition-colors"
									style:height="{(segment.value / maxValue) * 100}%"
									style:background-color={segment.color}
								></div>
							{/each}
						</div>
					{:else if variant === 'stacked'}
						<div class="flex flex-col-reverse w-full h-full">
							{#each item.values as segment, j}
								<div
									class="w-full transition-colors"
									class:rounded-t-control={j === item.values.length - 1}
									class:rounded-b-control={j === 0}
									style:height="{(segment.value / maxValue) * 100}%"
									style:background-color={segment.color}
								></div>
							{/each}
						</div>
					{/if}
				</div>
				<span class="text-xs text-muted-contrast shrink-0 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{item.label}</span>
			</div>
		{/each}
	</div>
</div>
