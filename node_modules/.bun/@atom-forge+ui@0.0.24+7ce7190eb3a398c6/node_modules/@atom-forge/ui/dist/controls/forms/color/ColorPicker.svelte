<script lang="ts">
	import type { AnyProp, ClassProp, XOR } from "../../../helpers/types";
	import { untrack } from 'svelte';
	import { twMerge } from "tailwind-merge";

	let {
		value = $bindable('#ffffff'),
		disabled,
		compact,
		small,
		class: classes = '',
		...props
	}:
		& AnyProp
		& ClassProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?: string
		disabled?: boolean
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	const wrapperClass = $derived(twMerge(
		'relative inline-flex items-center gap-2 border border-frame rounded-control bg-control',
		disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
		size === 'normal'  && 'h-10 px-2',
		size === 'compact' && 'h-8 px-1.5',
		size === 'small'   && 'h-6 px-1',
		classes
	));

	const swatchClass = twMerge(
		'rounded-fine border border-frame flex-shrink-0',
		size === 'normal'  && 'h-5 w-5',
		size === 'compact' && 'h-4 w-4',
		size === 'small'   && 'h-3 w-3',
	);

	const hexClass = twMerge(
		'font-mono text-muted-contrast',
		size === 'normal'  && 'text-sm',
		size === 'compact' && 'text-xs',
		size === 'small'   && 'text-[10px]',
	);

	const inputClass = $derived(disabled ? 'absolute inset-0 w-full h-full opacity-0 cursor-not-allowed' : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer');
</script>

<div class={wrapperClass} {...props}>
	<span class={swatchClass} style:background-color={value}></span>
	<span class={hexClass}>{value}</span>
	<input type="color" class={inputClass} bind:value {disabled} />
</div>
