<script lang="ts">
	import type {ClassProp, XOR} from "../../../index";
	import {untrack} from "svelte";
	import SliderView from './SliderView.svelte';
	import type {SliderSize} from './theme';

	let {
		value = $bindable(50),
		min = 0,
		max = 100,
		step = 1,
		disabled,
		compact,
		small,
		drawStops,
		showValue,
		class: classes,
	}: & ClassProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		drawStops?: boolean;
		showValue?: boolean | ((value: number) => string);
	} = $props();

	const effectiveSize: SliderSize = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	untrack(() => {
		const clamped = Math.max(min, Math.min(max, value));
		if (clamped !== value) {
			console.error(`[Slider] value (${value}) is outside [${min}, ${max}], clamped to ${clamped}.`);
			value = clamped;
		}
	});

	function handleUpdate(newValues: number[]) { value = newValues[0]; }
</script>

<SliderView
	values={[value]}
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
