<script lang="ts">
	import type {XOR} from "../../../index";
	import {untrack} from 'svelte';
	import {ChevronDown} from 'lucide-svelte';
	import {Icon} from "../../general/icon";
	import {twMerge} from 'tailwind-merge';

	type Option = { value: any; label: string };

	let {
		options,
		value = $bindable(),
		placeholder = 'Select an option',
		disabled,
		borderless,
		compact,
		small,
	}: & XOR<{ small: true }, { compact: true }, {}>
		& {
		options: Option[];
		value?: any;
		placeholder?: string;
		disabled?: boolean;
		borderless?: boolean;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	const selectedOption = $derived(options.find(opt => opt.value == value));

	const containerClass = $derived(twMerge(
		'relative w-full rounded-control overflow-hidden bg-control',
		!borderless && 'border border-frame',
		borderless && 'bg-transparent',
		size === 'normal'  && 'h-10 text-sm',
		size === 'compact' && 'h-8 text-xs',
		size === 'small'   && 'h-6 text-xs',
		disabled && 'opacity-70',
	));

	const textBlockClass = twMerge(
		'flex items-center truncate grow text-canvas-contrast',
		size === 'normal' ? 'pl-3' : 'pl-2',
	);

	const chevronBlockClass = twMerge(
		'flex items-center justify-center aspect-square',
		size === 'small' && 'scale-75',
	);
</script>

<div class={containerClass}>
	<div class="relative w-full h-full flex flex-row items-stretch justify-between">
		<span class={textBlockClass}>
			{#if selectedOption}
				{selectedOption.label}
			{:else}
				<span class="text-muted-contrast">{placeholder}</span>
			{/if}
		</span>
		<span class={chevronBlockClass}>
			<span class="pointer-events-none">
				<Icon icon={ChevronDown} size="5" class="text-muted-contrast"/>
			</span>
		</span>
	</div>

	<select class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
	        bind:value {disabled}>
		{#if placeholder}
			<option value={undefined} disabled selected>{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
