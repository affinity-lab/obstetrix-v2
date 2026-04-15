<script lang="ts">
	import {type AnyProp, type ClassProp, defineIcon, Icon, type IconDefinition, type XOR} from "../../../index";
	import {twMerge} from "tailwind-merge";
	import {Eye, EyeOff} from 'lucide-svelte';
	import type {Snippet} from 'svelte';
	import {untrack} from 'svelte';

	type InputType = 'text' | 'integer' | 'float' | 'password';
	type Size = 'normal' | 'compact' | 'small';

	let {
		value = $bindable(''),
		type = 'text' as InputType,
		placeholder,
		disabled,
		invalid,
		compact,
		monospace,
		small,
		icon,
		prefix,
		suffix,
		class: classes,
		...props
	}: & ClassProp
		& AnyProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		value?: string;
		type?: InputType;
		placeholder?: string;
		disabled?: boolean;
		invalid?: boolean;
		monospace?: boolean;
		icon?: IconDefinition;
		prefix?: Snippet | string;
		suffix?: Snippet | string;
	} = $props();

	let isPasswordVisible = $state(false);

	const size: Size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');

	const wrapperClass = $derived(twMerge(
		'relative flex items-center rounded-control border bg-control border-frame transition-colors',
		size === 'normal'  && 'h-10 text-xs',
		size === 'compact' && 'h-8 text-xs',
		size === 'small'   && 'h-6 text-xs',
		disabled  && 'cursor-not-allowed bg-muted/50 opacity-70 striped-10',
		monospace && 'font-mono',
		invalid ? 'border-error text-error' : 'border-frame',
		classes,
	));

	const inputClass = untrack(() => twMerge(
		'w-full border-none bg-transparent focus:ring-0 disabled:cursor-not-allowed text-canvas-contrast placeholder:text-muted-contrast',
		size === 'normal'  && 'px-3',
		size === 'compact' && 'px-2 text-sm',
		size === 'small'   && 'px-2 text-xs',
		!!icon && 'pl-9',
		type === 'password' && 'pr-9',
	));

	const affixClass = twMerge(
		'flex-shrink-0 text-muted-contrast',
		size === 'normal'  && 'px-3',
		size === 'compact' && 'px-2',
		size === 'small'   && 'px-2',
	);

	const htmlType = $derived(type === 'password' ? (isPasswordVisible ? 'text' : 'password') : 'text');

	function formatValue(currentValue: string): string {
		let val = currentValue;
		if (type === 'integer') {
			val = val.replace(/[^0-9]/g, '');
		} else if (type === 'float') {
			const parts = val.split('.');
			if (parts.length > 2) {
				val = parts[0] + '.' + parts.slice(1).join('');
			}
			val = val.replace(/[^0-9.]/g, '');
		}
		return val;
	}

	function handleInput(e: Event) {
		const inputEl = e.target as HTMLInputElement;
		const formattedValue = formatValue(inputEl.value);
		if (inputEl.value !== formattedValue) {
			const selectionStart = inputEl.selectionStart || 0;
			const charsRemovedBeforeCursor = inputEl.value.substring(0, selectionStart).length - formattedValue.substring(0, selectionStart).length;
			const newCursorPos = selectionStart - charsRemovedBeforeCursor;
			inputEl.value = formattedValue;
			inputEl.setSelectionRange(newCursorPos, newCursorPos);
		}
		value = formattedValue;
	}

	let inputEl: HTMLInputElement | null = null;
	export function focus() {
		inputEl?.focus();
	}
</script>

<div class={wrapperClass}>
	{#if prefix}
		<div class="{affixClass} border-r border-frame">
			{#if typeof prefix === 'string'}
				<span>{prefix}</span>
			{:else}
				{@render prefix()}
			{/if}
		</div>
	{/if}

	<div class="relative flex h-full w-full items-center">
		{#if icon}
			<div class="absolute left-3 text-muted-contrast">
				<Icon icon={icon} size="5"/>
			</div>
		{/if}
		<input
			bind:this={inputEl}
			type={htmlType}
			class={inputClass}
			{placeholder}
			{disabled}
			value={value}
			oninput={handleInput}
			{...props}
		/>
		{#if type === 'password'}
			<button
				type="button"
				class="absolute right-3 text-muted-contrast hover:text-canvas-contrast focus:outline-none cursor-pointer"
				onclick={() => isPasswordVisible = !isPasswordVisible}
			>
				<Icon icon={defineIcon(isPasswordVisible ? EyeOff : Eye)} size="5"/>
			</button>
		{/if}
	</div>

	{#if suffix}
		<div class="{affixClass} border-l border-frame">
			{#if typeof suffix === 'string'}
				<span>{suffix}</span>
			{:else}
				{@render suffix()}
			{/if}
		</div>
	{/if}
</div>
