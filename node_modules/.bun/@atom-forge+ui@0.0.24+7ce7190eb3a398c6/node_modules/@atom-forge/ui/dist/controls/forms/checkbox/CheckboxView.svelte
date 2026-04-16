<script lang="ts">
	import type { ClassProp } from "../../../helpers/types";
	import { Icon } from '../../general/icon';
	import { Check, Minus } from 'lucide-svelte';
	import { twMerge } from 'tailwind-merge';

	type Status = 'checked' | 'some' | 'unchecked';

	let {
		status = 'unchecked' as Status,
		label = '',
		disabled = false,
		primary,
		accent,
		compact,
		small,
		onclick = () => {},
		class: classes = ''
	}: {
		status?: Status;
		label?: string;
		disabled?: boolean;
		primary?: boolean;
		accent?: boolean;
		compact?: boolean;
		small?: boolean;
		onclick?: (event: MouseEvent) => void;
	} & ClassProp = $props();

	const isNormal = $derived(!compact && !small);
	const isActive = $derived(status === 'checked' || status === 'some');

	const wrapperClass = $derived(twMerge(
		'inline-flex items-center gap-2 select-none rounded-control-sm py-1 px-2 transition-colors duration-150',
		!disabled && !primary && !accent && 'cursor-pointer hover:bg-secondary',
		!disabled && !!primary                && 'cursor-pointer hover:bg-primary/10',
		!disabled && !!accent                 && 'cursor-pointer hover:bg-accent/10',
		disabled && 'cursor-not-allowed opacity-50',
		classes
	));

	const boxClass = $derived(twMerge(
		'flex items-center justify-center shrink-0 rounded border-2 transition-colors',
		isNormal  && 'w-5 h-5',
		!!compact && 'w-4 h-4',
		!!small   && 'w-3.5 h-3.5',
		isActive && !primary && !accent && 'bg-secondary border-frame text-secondary-contrast',
		isActive && !!primary           && 'bg-primary border-primary text-primary-contrast',
		isActive && !!accent            && 'bg-accent border-accent text-accent-contrast',
		!isActive && 'bg-control border-frame',
	));

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			onclick(e as unknown as MouseEvent);
		}
	}
</script>

<div
	class={wrapperClass}
	role="checkbox"
	aria-checked={status === 'some' ? 'mixed' : status === 'checked'}
	aria-disabled={disabled || undefined}
	tabindex={!disabled ? 0 : undefined}
	onclick={!disabled ? onclick : undefined}
	onkeydown={!disabled ? handleKeyDown : undefined}
>
	<span class={boxClass} aria-hidden="true">
		{#if status === 'checked'}
			<Icon icon={Check} stroke="9" size={isNormal ? '4' : '3'}/>
		{:else if status === 'some'}
			<Icon icon={Minus} stroke="9" size={isNormal ? '4' : '3'}/>
		{/if}
	</span>
	{#if label}
		<span class={twMerge(
			'text-canvas-contrast',
			!!compact && 'text-sm',
			!!small   && 'text-xs'
		)}>{label}</span>
	{/if}
</div>
