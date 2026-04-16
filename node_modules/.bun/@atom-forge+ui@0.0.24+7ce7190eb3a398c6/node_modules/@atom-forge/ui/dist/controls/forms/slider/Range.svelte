<script lang="ts">
	import type {ClassProp, XOR} from "../../../index";
	import {untrack} from "svelte";
	import SliderView from './SliderView.svelte';
	import type {SliderSize} from './theme';

	let {
		value = $bindable([25, 75]),
		min = 0,
		max = 100,
		step = 1,
		distance,
		disabled,
		compact,
		small,
		drawStops,
		showValue,
		class: classes,
	}: & ClassProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?: [number, number];
		min?: number;
		max?: number;
		step?: number;
		distance?: { min?: number, max?: number };
		disabled?: boolean;
		drawStops?: boolean;
		showValue?: boolean | ((value: number) => string);
	} = $props();

	const effectiveSize: SliderSize = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	untrack(() => {
		const clamped: [number, number] = [
			Math.max(min, Math.min(max, value[0])),
			Math.max(min, Math.min(max, value[1])),
		];
		if (clamped[0] !== value[0] || clamped[1] !== value[1]) {
			console.error(`[Range] value ([${value}]) is outside [${min}, ${max}], clamped to [${clamped}].`);
			value = clamped;
		}
	});

	function handleUpdate(newValues: number[]) {
		let [newMin, newMax] = newValues.sort((a, b) => a - b);

		// Determine which value changed
		const minChanged = newMin !== value[0];
		const maxChanged = newMax !== value[1];

		if (distance?.min) {
			if (newMax - newMin < distance.min) {
				if (minChanged) {
					// Min moved towards max -> push max
					newMax = newMin + distance.min;
					// If max hits boundary, push min back
					if (newMax > max) {
						newMax = max;
						newMin = newMax - distance.min;
					}
				} else if (maxChanged) {
					// Max moved towards min -> push min
					newMin = newMax - distance.min;
					// If min hits boundary, push max back
					if (newMin < min) {
						newMin = min;
						newMax = newMin + distance.min;
					}
				}
			}
		}

		if (distance?.max) {
			if (newMax - newMin > distance.max) {
				if (minChanged) {
					newMax = newMin + distance.max;
					if (newMax > max) {
						newMax = max;
						newMin = newMax - distance.max;
					}
				} else if (maxChanged) {
					newMin = newMax - distance.max;
					if (newMin < min) {
						newMin = min;
						newMax = newMin + distance.max;
					}
				}
			}
		}

		// Ensure values are within bounds (just in case)
		newMin = Math.max(min, Math.min(newMin, max));
		newMax = Math.max(min, Math.min(newMax, max));

		value = [newMin, newMax];
	}
</script>

<SliderView
	values={value}
	{min}
	{max}
	{step}
	size={effectiveSize}
	{disabled}
	{drawStops}
	{showValue}
	class={classes}
	onUpdate={handleUpdate}
/>
