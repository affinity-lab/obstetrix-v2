<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { XOR } from '../../../helpers/types';
	import { twMerge } from 'tailwind-merge';

	let {
		items,
		alternate = false,
		left,
		right,
		top,
		bottom,
		class: lineClass,
		children,
		dot: dotSnippet,
	}: XOR<{ left: true }, { right: true }, { top: true }, { bottom: true }, {}> & {
		items: any[];
		alternate?: boolean;
		class?: string;
		children: Snippet<[any]>;
		dot?: Snippet<[any]>;
	} = $props();

	const isHorizontal = $derived(!!(top || bottom));
	// For alternate vertical: which side the first item lands on
	const altFirstLeft = $derived(!!left);
	// For non-alternate vertical: dot is on the right when `left` content prop is set
	const dotOnRight = $derived(!!left);

	const lineBase = 'bg-frame';
	const defaultDotCls = 'w-3 h-3 rounded-full bg-secondary border-2 border-surface shrink-0';
</script>

{#snippet dotEl(item: any)}
	{#if dotSnippet}
		{@render dotSnippet(item)}
	{:else}
		<div class={defaultDotCls}></div>
	{/if}
{/snippet}

{#if !isHorizontal}
	<!-- ── Vertical ─────────────────────────────────────────────────────── -->

	{#if !alternate}
		<!-- Single-side: all content on one side of the line -->
		<div class="relative flex flex-col">
			<!-- continuous line -->
			<div class={twMerge(
				'absolute top-0 bottom-0 w-0.5',
				lineBase,
				dotOnRight ? 'right-4' : 'left-4',
				lineClass,
			)}></div>

			{#each items as item}
				<div class={twMerge(
					'relative flex items-start gap-4 pb-6 last:pb-0',
					dotOnRight && 'flex-row-reverse',
				)}>
					<!-- dot column: w-8 so the line sits at left-4 / right-4 -->
					<div class="w-8 shrink-0 flex justify-center pt-0.5 z-10">
						{@render dotEl(item)}
					</div>
					<div class={twMerge(
						'flex-1 min-w-0',
						dotOnRight && 'text-right'
					)}>
						{@render children(item)}
					</div>
				</div>
			{/each}
		</div>

	{:else}
		<!-- Alternate: 3-column grid, content flips left/right per item -->
		<div class="relative grid grid-cols-[1fr_2rem_1fr]">
			<div class={twMerge(
				'absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5',
				lineBase,
				lineClass,
			)}></div>

			{#each items as item, i}
				{@const onLeft = altFirstLeft ? i % 2 === 0 : i % 2 === 1}
				{#if onLeft}
					<!-- content left | dot | empty right -->
					<div class="pb-6 pr-4 min-w-0 text-right">{@render children(item)}</div>
					<div class="flex justify-center pt-0.5 z-10 relative">{@render dotEl(item)}</div>
					<div class="pb-6"></div>
				{:else}
					<!-- empty left | dot | content right -->
					<div class="pb-6"></div>
					<div class="flex justify-center pt-0.5 z-10 relative">{@render dotEl(item)}</div>
					<div class="pb-6 pl-4 min-w-0">{@render children(item)}</div>
				{/if}
			{/each}
		</div>
	{/if}

{:else}
	<!-- ── Horizontal ───────────────────────────────────────────────────── -->

	{#if !alternate}
		<!-- Single-side: all content either above or below the dot row -->
		<div class={twMerge('flex flex-col', top && 'flex-col-reverse')}>
			<!-- dot row with line -->
			<div class="relative flex flex-row py-1">
				<div class={twMerge(
					'absolute inset-y-0 my-auto left-0 right-0 h-0.5',
					lineBase,
					lineClass,
				)}></div>
				{#each items as item}
					<div class="flex-1 flex justify-center z-10">
						{@render dotEl(item)}
					</div>
				{/each}
			</div>
			<!-- content row -->
			<div class="flex flex-row">
				{#each items as item}
					<div class="flex-1 px-2 pt-2 min-w-0">
						{@render children(item)}
					</div>
				{/each}
			</div>
		</div>

	{:else}
		<!-- Horizontal alternate: content alternates above/below the dot row -->
		<div class="flex flex-col">
			<!-- above-dot content row (odd items by default, even if top) -->
			<div class="flex flex-row">
				{#each items as item, i}
					{@const showAbove = top ? i % 2 === 0 : i % 2 === 1}
					<div class="flex-1 px-2 pb-2 min-w-0">
						{#if showAbove}{@render children(item)}{/if}
					</div>
				{/each}
			</div>

			<!-- dot row with line -->
			<div class="relative flex flex-row py-1">
				<div class={twMerge(
					'absolute inset-y-0 my-auto left-0 right-0 h-0.5',
					lineBase,
					lineClass,
				)}></div>
				{#each items as item}
					<div class="flex-1 flex justify-center z-10">
						{@render dotEl(item)}
					</div>
				{/each}
			</div>

			<!-- below-dot content row -->
			<div class="flex flex-row">
				{#each items as item, i}
					{@const showBelow = top ? i % 2 === 1 : i % 2 === 0}
					<div class="flex-1 px-2 pt-2 min-w-0">
						{#if showBelow}{@render children(item)}{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/if}
