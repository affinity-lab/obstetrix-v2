<script lang="ts">
	import type { ChildrenPropOptional, ClassProp } from '../../../helpers/types';
	import { twMerge } from 'tailwind-merge';

	export type RingDef = {
		value: number;
		max?: number;
		color?: string;
	};

	let {
		value = 0,
		max = 100,
		size = 120,
		strokeWidth = 12,
		gap = 4,
		color = 'var(--color-accent)',
		trackColor = 'var(--color-secondary)',
		rings,
		label,
		labelClass,
		class: classes,
		children,
	}: ClassProp &
		ChildrenPropOptional & {
			value?: number;
			max?: number;
			size?: number;
			strokeWidth?: number;
			gap?: number;
			color?: string;
			trackColor?: string;
			rings?: RingDef[];
			label?: string;
			labelClass?: string;
		} = $props();

	const cx = $derived(size / 2);

	const resolvedRings = $derived(rings ?? [{ value, max, color }]);

	function getGeometry(index: number) {
		const r = (size - strokeWidth) / 2 - index * (strokeWidth + gap);
		const circ = 2 * Math.PI * r;
		return { r, circ };
	}

	const singleClamped = $derived(rings ? 0 : Math.max(0, Math.min(value, max)));
	const singlePercentage = $derived(rings ? 0 : max > 0 ? (singleClamped / max) * 100 : 0);
</script>

<div
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={rings ? undefined : max}
	aria-valuenow={rings ? undefined : singleClamped}
	class={twMerge('relative inline-flex items-center justify-center', classes)}
	style:width="{size}px"
	style:height="{size}px"
>
	<svg width={size} height={size} aria-hidden="true" style:display="block">
		{#each resolvedRings as ring, i}
			{@const { r, circ } = getGeometry(i)}
			{@const ringMax = ring.max ?? 100}
			{@const ringColor = ring.color ?? color}
			{@const clamped = Math.max(0, Math.min(ring.value, ringMax))}
			{@const offset = ringMax > 0 ? circ * (1 - clamped / ringMax) : circ}
			<!-- Track -->
			<circle cx={cx} cy={cx} r={r} fill="none" stroke={trackColor} stroke-width={strokeWidth} />
			<!-- Progress arc -->
			<circle
				cx={cx}
				cy={cx}
				r={r}
				fill="none"
				stroke={ringColor}
				stroke-width={strokeWidth}
				stroke-linecap="round"
				stroke-dasharray={circ}
				stroke-dashoffset={offset}
				transform="rotate(-90 {cx} {cx})"
				style="transition: stroke-dashoffset 0.35s ease-in-out"
			/>
		{/each}
	</svg>
	<div class="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
		{#if children}
			{@render children()}
		{:else if !rings}
			<span class={twMerge('text-sm font-semibold text-canvas-contrast tabular-nums', labelClass)}>
				{label ?? `${Math.round(singlePercentage)}%`}
			</span>
		{/if}
	</div>
</div>
