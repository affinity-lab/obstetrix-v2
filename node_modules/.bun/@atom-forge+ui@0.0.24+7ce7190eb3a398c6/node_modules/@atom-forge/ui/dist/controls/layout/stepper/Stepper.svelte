<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { untrack } from 'svelte';
	import { Check } from 'lucide-svelte';
	import type { ClassProp } from '../../../helpers/types';

	export type Step = { id: string; label: string; description?: string };

	let {
		steps = [],
		current = $bindable(steps[0]?.id ?? ''),
		orientation = 'horizontal',
		readonly = true,
		compact = false,
		class: classes,
	}: {
		steps?: Step[];
		current?: string;
		orientation?: 'horizontal' | 'vertical';
		readonly?: boolean;
		compact?: boolean;
	} & ClassProp = $props();

	const isCompact = untrack(() => compact);
	const iconSize = isCompact ? 13 : 15;
	const iconCls = isCompact ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

	const currentIndex = $derived(steps.findIndex(s => s.id === current));

	function getState(index: number): 'completed' | 'current' | 'upcoming' {
		if (index < currentIndex) return 'completed';
		if (index === currentIndex) return 'current';
		return 'upcoming';
	}

	function handleClick(step: Step, index: number) {
		if (!readonly && index < currentIndex) {
			current = step.id;
		}
	}

	const isVertical = $derived(orientation === 'vertical');
</script>

<nav aria-label="Progress" class={twMerge('', classes)}>
	<ol class={isVertical ? 'flex flex-col' : 'flex items-start'}>
		{#each steps as step, i}
			{@const state = getState(i)}
			{@const isCompleted = state === 'completed'}
			{@const isCurrent = state === 'current'}
			{@const isClickable = !readonly && isCompleted}
			{@const isLast = i === steps.length - 1}

			{#if isVertical}
				<!-- Vertical layout -->
				<li
					aria-current={isCurrent ? 'step' : undefined}
					class={twMerge('relative flex gap-3', !isLast && 'pb-6')}
				>
					<!-- icon + connector column -->
					<div class="relative flex flex-col items-center">
						{#if isClickable}
							<button
								type="button"
								onclick={() => handleClick(step, i)}
								aria-label="{step.label} — Back to this step"
								class={twMerge(
									'rounded-full flex items-center justify-center shrink-0 font-semibold cursor-pointer',
									'ring-2 ring-transparent hover:ring-accent/40 transition-shadow',
									iconCls,
									isCompleted ? 'use-accent' : 'use-secondary',
								)}
							>
								<Check size={iconSize} strokeWidth={2.5} />
							</button>
						{:else}
							<div class={twMerge(
								'rounded-full flex items-center justify-center shrink-0 font-semibold select-none',
								iconCls,
								(isCompleted || isCurrent) ? 'use-accent' : 'use-secondary',
							)}>
								{#if isCompleted}
									<Check size={iconSize} strokeWidth={2.5} />
								{:else}
									{i + 1}
								{/if}
							</div>
						{/if}

						{#if !isLast}
							<div class={twMerge(
								'flex-1 w-0.5 mt-1.5',
								isCompleted ? 'bg-accent' : 'bg-frame',
							)}></div>
						{/if}
					</div>

					<!-- label + description -->
					<div class={twMerge('min-w-0', isCompact ? 'pt-0.5' : 'pt-1')}>
						<span class={twMerge(
							'block font-medium leading-tight',
							isCompact ? 'text-xs' : 'text-sm',
							(isCompleted || isCurrent) ? 'text-canvas-contrast' : 'text-muted-contrast',
						)}>
							{step.label}
							{#if isCompleted}<span class="sr-only">(Completed)</span>{/if}
						</span>
						{#if step.description && !isCompact}
							<p class="mt-0.5 text-xs text-muted-contrast">{step.description}</p>
						{/if}
					</div>
				</li>

			{:else}
				<!-- Horizontal layout -->
				<li
					aria-current={isCurrent ? 'step' : undefined}
					class="flex-1 flex flex-col items-center min-w-0"
				>
					<!-- icon row with connector lines -->
					<div class="relative w-full flex items-center justify-center">
						<!-- left connector (not for first step) -->
						{#if i > 0}
							<div class={twMerge(
								'absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-0.5',
								getState(i - 1) === 'completed' ? 'bg-accent' : 'bg-frame',
							)}></div>
						{/if}

						<!-- step icon -->
						{#if isClickable}
							<button
								type="button"
								onclick={() => handleClick(step, i)}
								aria-label="{step.label} — Back to this step"
								class={twMerge(
									'relative z-10 rounded-full flex items-center justify-center shrink-0 font-semibold cursor-pointer',
									'ring-2 ring-transparent hover:ring-accent/40 transition-shadow',
									iconCls,
									isCompleted ? 'use-accent' : 'use-secondary',
								)}
							>
								<Check size={iconSize} strokeWidth={2.5} />
							</button>
						{:else}
							<div class={twMerge(
								'relative z-10 rounded-full flex items-center justify-center shrink-0 font-semibold select-none',
								iconCls,
								(isCompleted || isCurrent) ? 'use-accent' : 'use-secondary',
							)}>
								{#if isCompleted}
									<Check size={iconSize} strokeWidth={2.5} />
								{:else}
									{i + 1}
								{/if}
							</div>
						{/if}

						<!-- right connector (not for last step) -->
						{#if !isLast}
							<div class={twMerge(
								'absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-0.5',
								isCompleted ? 'bg-accent' : 'bg-frame',
							)}></div>
						{/if}
					</div>

					<!-- label + description below icon -->
					<div class={twMerge('text-center px-1 w-full', isCompact ? 'mt-1.5' : 'mt-2')}>
						<span class={twMerge(
							'block font-medium leading-tight truncate',
							isCompact ? 'text-xs' : 'text-sm',
							(isCompleted || isCurrent) ? 'text-canvas-contrast' : 'text-muted-contrast',
						)}>
							{step.label}
							{#if isCompleted}<span class="sr-only">(Completed)</span>{/if}
						</span>
						{#if step.description && !isCompact}
							<p class="mt-0.5 text-xs text-muted-contrast line-clamp-2">{step.description}</p>
						{/if}
					</div>
				</li>
			{/if}
		{/each}
	</ol>
</nav>
