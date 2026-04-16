<script lang="ts">
	import {twMerge} from 'tailwind-merge';
	import type {ClassProp, XOR} from '../../../helpers/types';
	import {Icon, type IconDefinition} from '../../general/icon';

	let {
		animated = true,
		icon,
		class: classes,
		circle,
		rect: _rect,
		length,
	}: ClassProp
		& XOR<{ circle: true }, { rect: true }, { length: boolean | number | number[] }>
		& {
		animated?: boolean;
		icon?:     IconDefinition;
	} = $props();

	// Normalize length to array of widths
	const lines = $derived.by((): number[] | null => {
		if (length === undefined) return null;
		if (length === true)      return [100];
		if (typeof length === 'number') return [length];
		if (Array.isArray(length))      return length;
		return null;
	});

	const baseClass = $derived(twMerge(
		'bg-secondary relative overflow-hidden',
		animated && 'skeleton-shimmer',
		circle && 'rounded-full',
		!circle && 'rounded-control',
	));
</script>

{#if lines}
	<div class={twMerge('flex flex-col gap-2', classes)} aria-hidden="true">
		{#each lines as width}
			<div
				class={twMerge(baseClass, 'h-4 rounded')}
				style="width: {width}%"
			></div>
		{/each}
	</div>
{:else}
	<div
		class={twMerge(baseClass, classes)}
		aria-hidden="true"
	>
		{#if icon}
			<div class="absolute inset-0 flex items-center justify-center opacity-30">
				<Icon {icon} pxSize={24}/>
			</div>
		{/if}
	</div>
{/if}


