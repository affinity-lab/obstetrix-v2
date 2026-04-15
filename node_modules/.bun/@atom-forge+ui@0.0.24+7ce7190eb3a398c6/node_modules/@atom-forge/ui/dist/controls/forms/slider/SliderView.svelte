<script lang="ts">
	import type {ClassProp} from "../../../index";
	import type {SliderSize} from './theme';
	import {getPercentage, getValueFromClientX} from './utils';
	import {untrack} from 'svelte';
	import {twMerge} from "tailwind-merge";

	let {
		values,
		min,
		max,
		step,
		size,
		disabled,
		drawStops,
		showValue,
		class: classes,
		onUpdate
	}: & ClassProp
		& {
		values: number[];
		min: number;
		max: number;
		step: number;
		size: SliderSize;
		disabled?: boolean;
		drawStops?: boolean;
		showValue?: boolean | ((value: number) => string);
		onUpdate: (values: number[]) => void;
	} = $props();

	let trackEl: HTMLDivElement | null = null;
	let activeThumbIndex = $state<number | null>(null);
	let percents = $state<number[]>([]);
	let visualValues = $state<number[]>(untrack(() => [...values]));
	let isDragging = $state(false);
	let stops = $state<number[]>([]);

	const wrapperClass = $derived(twMerge(
		'relative w-full flex items-center touch-none',
		size === 'normal'  && 'h-6',
		size === 'compact' && 'h-5',
		size === 'small'   && 'h-4',
		disabled && 'opacity-50 cursor-not-allowed',
		classes,
	));
	const trackClass = untrack(() => twMerge(
		'relative w-full rounded-full bg-secondary shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
		size === 'normal'  && 'h-6 px-1',
		size === 'compact' && 'h-5 px-1',
		size === 'small'   && 'h-4 px-1',
	));
	const rangeClass = untrack(() => twMerge(
		'absolute bg-accent striped-10 shadow-inner z-10 top-1/2 -translate-y-1/2 rounded-full',
		size === 'normal'  && 'h-4',
		size === 'compact' && 'h-3',
		size === 'small'   && 'h-2',
	));
	const thumbClass = $derived(twMerge(
		'absolute bg-white rounded-full shadow-md border border-frame cursor-pointer transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-20',
		size === 'normal'  && 'h-5 w-5',
		size === 'compact' && 'h-4 w-4',
		size === 'small'   && 'h-3 w-3',
		disabled && 'cursor-not-allowed',
	));
	const stopClass = 'absolute w-1.5 h-1.5 bg-muted-contrast/50 rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2';

	$effect(() => {
		if (drawStops && step > 0 && trackEl) {
			const numStops = (max - min) / step;
			if (numStops < 100) {
				stops = Array.from({length: numStops + 1}, (_, i) => {
					const stopValue = min + i * step;
					return getPercentage(stopValue, min, max, trackEl!, size);
				});
			} else {
				stops = [];
			}
		}
	});

	$effect(() => {
		if (!isDragging) {
			visualValues = values;
		} else if (activeThumbIndex !== null) {
			const newVisuals = [...visualValues];
			let changed = false;
			values.forEach((val, i) => {
				if (i !== activeThumbIndex && val !== newVisuals[i]) {
					newVisuals[i] = val;
					changed = true;
				}
			});
			if (changed) {
				visualValues = newVisuals;
			}
		}
	});

	$effect(() => {
		if (trackEl) {
			percents = visualValues.map(v => getPercentage(v, min, max, trackEl!, size));
		}
	});

	function handleMouseDown(e: MouseEvent | TouchEvent, index: number) {
		if (disabled) return;
		isDragging = true;
		activeThumbIndex = index;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('touchmove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchend', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent | TouchEvent) {
		if (activeThumbIndex === null || !trackEl) return;
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

		const rawValue = getValueFromClientX(clientX, min, max, step, trackEl, size, false);
		const newVisualValues = [...visualValues];
		newVisualValues[activeThumbIndex] = rawValue;
		visualValues = newVisualValues;

		const steppedValue = min + Math.round((rawValue - min) / step) * step;
		const newValues = [...values];
		newValues[activeThumbIndex] = steppedValue;
		onUpdate(newValues);
	}

	function handleMouseUp() {
		if (activeThumbIndex === null) return;
		isDragging = false;

		const finalValue = min + Math.round((visualValues[activeThumbIndex] - min) / step) * step;
		const newValues = [...values];
		newValues[activeThumbIndex] = finalValue;
		onUpdate(newValues);

		visualValues = newValues;

		activeThumbIndex = null;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('touchmove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('touchend', handleMouseUp);
	}

	function handleTrackClick(e: MouseEvent) {
		if (disabled || !trackEl) return;
		const newValue = getValueFromClientX(e.clientX, min, max, step, trackEl, size, true);

		let closestIndex = 0;
		let minDiff = Infinity;

		values.forEach((val, index) => {
			const diff = Math.abs(val - newValue);
			if (diff < minDiff) {
				minDiff = diff;
				closestIndex = index;
			}
		});

		const newValues = [...values];
		newValues[closestIndex] = newValue;
		onUpdate(newValues);

		visualValues = newValues;

		handleMouseDown(e, closestIndex);
	}

	const transitionStyle = $derived(isDragging ? 'transition: none;' : 'transition: all 100ms ease-out;');
	const displayValues  = $derived(visualValues.map(v => min + Math.round((v - min) / step) * step));
	const formatValue    = $derived(typeof showValue === 'function' ? showValue : (v: number) => String(v));
</script>

<div class={wrapperClass}>
	<div role="none"
	     bind:this={trackEl}
	     class={trackClass}
	     onmousedown={handleTrackClick}
	>
		{#if drawStops}
			{#each stops as stopPercent}
				<div class={stopClass} style:left="{stopPercent}%"></div>
			{/each}
		{/if}

		{#if percents.length > 0}
			{#if values.length > 1}
				<div
					class={rangeClass}
					style:left="{percents[0]}%"
					style:right="{100 - percents[1]}%"
					style={transitionStyle}
				></div>
			{:else}
				<div
					class={rangeClass}
					style:width="{percents[0]}%"
					style={transitionStyle}
				></div>
			{/if}

			{#each percents as percent, i}
				<div role="none"
				     class={thumbClass}
				     style:left="{percent}%"
				     style={transitionStyle}
				     onmousedown={(e) => {
						 e.stopPropagation();
						 handleMouseDown(e, i)
					 }}
				     ontouchstart={(e) => {
						 e.stopPropagation();
						 handleMouseDown(e, i)
					 }}
				>
					{#if showValue && isDragging && activeThumbIndex === i}
						<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 rounded bg-control border border-frame shadow-sm text-xs text-canvas-contrast tabular-nums whitespace-nowrap pointer-events-none select-none">
							{formatValue(displayValues[i])}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
