<script lang="ts">
	import type {ClassProp, XOR} from "../../../index";
	import {untrack} from 'svelte';
	import {twMerge} from "tailwind-merge";

	let {
		value = 0,
		max = 100,
		compact,
		small,
		class: classes
	}: & ClassProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?: number
		max?: number
	} = $props();

	const trackClass = untrack(() => twMerge(
		'relative w-full rounded-full bg-secondary shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] overflow-hidden',
		small ? 'h-1.5' : compact ? 'h-2.5' : 'h-4',
		classes,
	));
	const rangeClass = 'h-full bg-accent striped-10 shadow-inner transition-[width] duration-300 ease-in-out rounded-full';
	const progressPercent = $derived(max > 0 ? (value / max) * 100 : 0);
</script>

<div role="none"
     class={trackClass}
     title={`${Math.round(progressPercent)}%`}
>
	<div
		class={rangeClass}
		style:width="{progressPercent}%"
	></div>
</div>
