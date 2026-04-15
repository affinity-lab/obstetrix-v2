<script lang="ts">
	import { Icon } from '../../general/icon';
	import { getPopupManager } from '../../overlays/popup';
	import DatePickerCalendar from './DatePickerCalendar.svelte';
	import type { XOR } from '../../../helpers/types';
	import { Calendar, X } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		value = $bindable(null),
		format = (d: Date) => d.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}),
		placeholder = 'Select date',
		disabled = false,
		clearable = false,
		min,
		max,
		weekStart = 1,
		disabledDates,
		disabledDays,
		compact,
		small,
		class: classes = '',
	}: XOR<{}, { compact: true }, { small: true }> & {
		value?: Date | null;
		format?: (date: Date) => string;
		placeholder?: string;
		disabled?: boolean;
		clearable?: boolean;
		min?: Date;
		max?: Date;
		weekStart?: 0 | 1;
		disabledDates?: Date[];
		disabledDays?: number[];
		class?: string;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');
	const popupManager = getPopupManager();
	let isOpen = $state(false);

	// ── native input handler (mobile overlay) ─────────────────────────────────

	function pad(n: number) { return String(n).padStart(2, '0'); }

	function dateToNativeValue(d: Date): string {
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	function handleNativeInput(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		if (!v) { value = null; return; }
		const [y, m, d] = v.split('-').map(Number);
		value = new Date(y, m - 1, d);
	}

	// ── fancy popup (desktop) ─────────────────────────────────────────────────

	async function openDropdown(event: MouseEvent) {
		if (disabled || isOpen || window.matchMedia('(pointer: coarse)').matches) return;
		isOpen = true;
		const selected = await popupManager.open.component(
			DatePickerCalendar,
			{ value, min, max, weekStart, disabledDates, disabledDays },
			{ anchor: event.currentTarget as HTMLElement, align: 'left' }
		);
		isOpen = false;
		if (selected !== undefined) {
			value = selected as Date | null;
		}
	}

	function clearValue(event: MouseEvent) {
		event.stopPropagation();
		value = null;
	}

	// ── styles ────────────────────────────────────────────────────────────────

	const containerClass = $derived(twMerge(
		'relative w-full rounded-control bg-control border border-frame transition-colors cursor-pointer',
		size === 'normal'  && 'h-10 text-sm',
		size === 'compact' && 'h-8 text-xs',
		size === 'small'   && 'h-6 text-xs',
		isOpen && 'ring-2 ring-accent',
		disabled && 'opacity-70 cursor-not-allowed',
		classes,
	));

	const iconPad = size === 'normal' ? 'px-3' : 'px-2';
</script>

<div class={containerClass} role="none" onclick={openDropdown}>
	<!-- Native date input — always rendered; CSS enables pointer events on touch devices only -->
	<input
		type="date"
		value={value ? dateToNativeValue(value) : ''}
		min={min ? dateToNativeValue(min) : undefined}
		max={max ? dateToNativeValue(max) : undefined}
		{disabled}
		class="absolute inset-0 w-full h-full opacity-0 pointer-events-none [@media(pointer:coarse)]:pointer-events-auto cursor-pointer z-10"
		oninput={handleNativeInput}
	/>

	<div class="flex h-full flex-row items-center pointer-events-none">
		<span class={twMerge('flex items-center text-muted-contrast shrink-0', iconPad)}>
			<Icon icon={Calendar} size="4"/>
		</span>
		<span class={twMerge('flex-1 truncate text-canvas-contrast select-none', size === 'normal' ? 'pr-3' : 'pr-2')}>
			{#if value}
				{format(value)}
			{:else}
				<span class="text-muted-contrast">{placeholder}</span>
			{/if}
		</span>
	</div>

	{#if clearable && value && !disabled}
		<button
			type="button"
			onclick={clearValue}
			class={twMerge(
				'absolute right-0 top-0 h-full flex items-center justify-center shrink-0 rounded text-muted-contrast hover:text-canvas-contrast transition-colors z-20',
				iconPad,
			)}
			tabindex="-1"
		>
			<Icon icon={X} size="3.5"/>
		</button>
	{/if}
</div>
