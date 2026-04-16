<script lang="ts">
	import type {ClassProp, XOR} from "../../../index";
	import {untrack} from 'svelte';
	import {twMerge} from "tailwind-merge";
	import {getRadioGroupManager} from "./radio-group-manager.svelte";

	let {
		value,
		label,
		disabled,
		compact,
		small,
		class: classes
	}: ClassProp & XOR<{ compact: boolean }, { small: boolean }, {}> & {
		value: any
		label?: string
		disabled?: boolean
	} = $props();

	const manager = getRadioGroupManager();
	const size = untrack(() => manager.size ?? (compact ? 'compact' : small ? 'small' : 'normal'));
	const variant = untrack(() => manager.variant ?? 'default');

	const checked = $derived(manager.value === value);

	const wrapperClass = $derived(twMerge(
		'flex items-center gap-3 cursor-pointer',
		label && 'select-none rounded py-1 px-2',
		label && variant === 'default'  && 'hover:bg-secondary',
		label && variant === 'primary'  && 'hover:bg-primary/10',
		label && variant === 'accent'   && 'hover:bg-accent/10',
		disabled && 'opacity-50 cursor-default',
		size === 'normal'  && 'text-base',
		size === 'compact' && 'text-sm',
		size === 'small'   && 'text-xs',
		classes,
	));

	const boxClass = twMerge(
		'relative flex items-center justify-center rounded-full border-2 bg-control transition-colors',
		variant === 'default' && 'border-muted-contrast',
		variant === 'primary' && 'border-primary',
		variant === 'accent'  && 'border-accent',
		size === 'normal'  && 'h-5 w-5',
		size === 'compact' && 'h-4 w-4',
		size === 'small'   && 'h-3 w-3',
	);

	const dotClass = $derived(twMerge(
		'absolute rounded-full transition-transform duration-300',
		variant === 'default' && 'bg-muted-contrast',
		variant === 'primary' && 'bg-primary',
		variant === 'accent'  && 'bg-accent',
		checked ? 'scale-100' : 'scale-0',
		size === 'normal'  && 'h-2.5 w-2.5',
		size === 'compact' && 'h-2 w-2',
		size === 'small'   && 'h-1.5 w-1.5',
	));

	function handleChange() { if (!disabled) manager.value = value; }
</script>

<div role="none" class={wrapperClass} onclick={handleChange}>
	<div class={boxClass}>
		<div class={dotClass}></div>
	</div>
	{#if label}
		<span class="text-canvas-contrast">{label}</span>
	{/if}
</div>
