<script lang="ts">
	import type {ClassProp, XOR} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";
	import {ChevronLeft, ChevronRight} from "lucide-svelte";

	let {
		page,
		total,
		onchange,
		siblings = 1,
		compact,
		small,
		class: classes,
	}: ClassProp
		& XOR<{}, { compact: true }, { small: true }>
		& {
		page: number
		total: number
		onchange: (page: number) => void
		siblings?: number
	} = $props();

	const btnSize = $derived(
		small   ? 'h-6 w-6 text-xs'  :
		compact ? 'h-8 w-8 text-xs'  :
		          'h-10 w-10 text-sm'
	);

	const iconSize = $derived(small ? 12 : compact ? 14 : 16);

	const items = $derived.by(() => {
		if (total <= 1) return [1] as (number | 'left' | 'right')[];

		const rangeStart = Math.max(2, page - siblings);
		const rangeEnd   = Math.min(total - 1, page + siblings);

		const result: (number | 'left' | 'right')[] = [1];

		if (rangeStart > 2) result.push('left');
		for (let i = rangeStart; i <= rangeEnd; i++) result.push(i);
		if (rangeEnd < total - 1) result.push('right');

		if (total > 1) result.push(total);
		return result;
	});

	function goto(p: number) {
		if (p >= 1 && p <= total && p !== page) onchange(p);
	}
</script>

<nav class={twMerge('flex items-center gap-1', classes)} aria-label="Pagination">
	<button
		onclick={() => goto(page - 1)}
		disabled={page <= 1}
		class={twMerge(
			'flex items-center justify-center rounded border border-frame bg-secondary text-canvas-contrast',
			'hover:brightness-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
			btnSize
		)}
		aria-label="Previous page"
	>
		<ChevronLeft size={iconSize}/>
	</button>

	{#each items as item}
		{#if item === 'left' || item === 'right'}
			<span class={twMerge('flex items-center justify-center text-muted-contrast select-none', btnSize)}>
				…
			</span>
		{:else}
			<button
				onclick={() => goto(item)}
				disabled={item === page}
				aria-current={item === page ? 'page' : undefined}
				class={twMerge(
					'flex items-center justify-center rounded border font-medium transition-colors',
					btnSize,
					item === page
						? 'bg-accent text-accent-contrast border-accent cursor-default'
						: 'bg-secondary text-canvas-contrast border-frame hover:brightness-95'
				)}
			>
				{item}
			</button>
		{/if}
	{/each}

	<button
		onclick={() => goto(page + 1)}
		disabled={page >= total}
		class={twMerge(
			'flex items-center justify-center rounded border border-frame bg-secondary text-canvas-contrast',
			'hover:brightness-95 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
			btnSize
		)}
		aria-label="Next page"
	>
		<ChevronRight size={iconSize}/>
	</button>
</nav>
