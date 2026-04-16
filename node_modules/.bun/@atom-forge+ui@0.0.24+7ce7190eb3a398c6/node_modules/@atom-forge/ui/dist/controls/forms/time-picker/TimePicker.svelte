<script lang="ts">
	import { Icon } from '../../general/icon';
	import { getPopupManager } from '../../overlays/popup';
	import TimePickerPopup from './TimePickerPopup.svelte';
	import type { XOR } from '../../../helpers/types';
	import { Clock, X } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		value = $bindable(null),
		seconds = false,
		placeholder = 'Select time',
		disabled = false,
		clearable = false,
		round = false,
		compact,
		small,
		class: classes = '',
	}: XOR<{}, { compact: true }, { small: true }> & {
		value?: string | null;
		seconds?: boolean;
		placeholder?: string;
		disabled?: boolean;
		clearable?: boolean;
		round?: false | 0 | 5 | 10 | 15 | 20 | 30 | number[];
		class?: string;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');
	const popupManager = getPopupManager();

	// ── display helpers ───────────────────────────────────────────────────────

	function pad(n: number) { return String(n).padStart(2, '0'); }

	function formatDisplay(v: string): string {
		const [h, m, s] = v.split(':').map(Number);
		return seconds
			? `${pad(h)}:${pad(m)}:${pad(s ?? 0)}`
			: `${pad(h)}:${pad(m)}`;
	}

	function applyRound(h: number, m: number, s: number): string {
		if (round === false) {
			return seconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`;
		}
		let totalMinutes = h * 60 + m;
		if (Array.isArray(round)) {
			const nearest = round.reduce((prev, cur) =>
				Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev
			);
			const extraHours = Math.floor(nearest / 60);
			totalMinutes = (h + extraHours) * 60 + (nearest % 60);
		} else if (round === 0) {
			totalMinutes = Math.round(totalMinutes / 60) * 60;
		} else {
			totalMinutes = Math.round(totalMinutes / round) * round;
		}
		totalMinutes = Math.min(totalMinutes, 23 * 60 + 59);
		const rh = Math.floor(totalMinutes / 60) % 24;
		const rm = totalMinutes % 60;
		return seconds ? `${pad(rh)}:${pad(rm)}:00` : `${pad(rh)}:${pad(rm)}`;
	}

	// ── native input handler (mobile overlay) ─────────────────────────────────

	function handleNativeInput(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		if (v === '') { value = null; return; }
		const [h, m, s] = v.split(':').map(Number);
		value = applyRound(h, m ?? 0, s ?? 0);
	}

	// ── fancy popup (desktop) ─────────────────────────────────────────────────

	let isOpen = $state(false);

	async function openPopup(event: MouseEvent) {
		if (disabled || isOpen || window.matchMedia('(pointer: coarse)').matches) return;
		isOpen = true;
		const selected = await popupManager.open.component(
			TimePickerPopup,
			{ value, seconds, round },
			{ anchor: event.currentTarget as HTMLElement, align: 'left' }
		);
		isOpen = false;
		if (selected !== undefined) {
			value = selected as string | null;
		}
	}

	function clearValue(e: MouseEvent) {
		e.stopPropagation();
		value = null;
	}

	// ── styles ────────────────────────────────────────────────────────────────

	const containerClass = $derived(twMerge(
		'relative w-full rounded-control bg-control border border-frame transition-colors cursor-pointer select-none',
		size === 'normal'  && 'h-10 text-sm',
		size === 'compact' && 'h-8 text-xs',
		size === 'small'   && 'h-6 text-xs',
		isOpen && 'ring-2 ring-accent',
		disabled && 'opacity-70 cursor-not-allowed',
		classes,
	));

	const iconPad = size === 'normal' ? 'px-3' : 'px-2';
</script>

<div class={containerClass} role="none" onclick={openPopup}>
	<!-- Native time input — always rendered; CSS enables pointer events on touch devices only -->
	<input
		type="time"
		step={seconds ? 1 : 60}
		value={value ?? ''}
		{disabled}
		class="absolute inset-0 w-full h-full opacity-0 pointer-events-none [@media(pointer:coarse)]:pointer-events-auto cursor-pointer z-10"
		oninput={handleNativeInput}
	/>

	<div class="flex h-full flex-row items-center pointer-events-none">
		<span class={twMerge('flex items-center text-muted-contrast shrink-0', iconPad)}>
			<Icon icon={Clock} size="4" />
		</span>
		<span class={twMerge('flex-1 truncate text-canvas-contrast font-mono tabular-nums', size === 'normal' ? 'pr-3' : 'pr-2')}>
			{#if value}
				{formatDisplay(value)}
			{:else}
				<span class="text-muted-contrast font-sans">{placeholder}</span>
			{/if}
		</span>
	</div>

	{#if clearable && value != null && !disabled}
		<button
			type="button"
			class={twMerge(
				'absolute right-0 top-0 h-full flex items-center justify-center shrink-0 text-muted-contrast hover:text-canvas-contrast transition-colors z-20',
				iconPad,
			)}
			onclick={clearValue}
			tabindex="-1"
		>
			<Icon icon={X} size="3.5" />
		</button>
	{/if}
</div>
