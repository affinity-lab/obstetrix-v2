<script lang="ts">
	import {Card} from '../../display/card';
	import {Button} from '../../general/button';
	import {getPopupManager} from '../../overlays/popup';
	import {ChevronLeft, ChevronRight} from 'lucide-svelte';
	import {untrack} from 'svelte';
	import {twMerge} from 'tailwind-merge';

	let {
		value,
		min,
		max,
		weekStart = 1,
		disabledDates,
		disabledDays,
	}: {
		value?: Date | null;
		min?: Date;
		max?: Date;
		weekStart?: 0 | 1;
		disabledDates?: Date[];
		disabledDays?: number[];
	} = $props();

	const popupManager = getPopupManager();

	const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'];
	const ALL_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let viewYear = $state(untrack(() => value ? value.getFullYear() : today.getFullYear()));
	let viewMonth = $state(untrack(() => value ? value.getMonth() : today.getMonth()));

	const weekHeaders = $derived(
		Array.from({length: 7}, (_, i) => ALL_DAYS[(weekStart + i) % 7])
	);

	function startOfDay(d: Date): number {
		return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	}

	function isSameDay(a: Date, b: Date): boolean {
		return a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate();
	}

	function isDisabled(date: Date): boolean {
		if (min && startOfDay(date) < startOfDay(min)) return true;
		if (max && startOfDay(date) > startOfDay(max)) return true;
		if (disabledDays?.includes(date.getDay())) return true;
		if (disabledDates?.some(d => isSameDay(d, date))) return true;
		return false;
	}

	const calendarDays = $derived.by(() => {
		const firstDay = new Date(viewYear, viewMonth, 1);
		const offset = (firstDay.getDay() - weekStart + 7) % 7;
		const days: Date[] = [];
		for (let i = offset - 1; i >= 0; i--) days.push(new Date(viewYear, viewMonth, -i));
		const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
		for (let d = 1; d <= lastDate; d++) days.push(new Date(viewYear, viewMonth, d));
		let d = 1;
		while (days.length < 42) days.push(new Date(viewYear, viewMonth + 1, d++));
		return days;
	});

	function prevMonth() {
		if (viewMonth === 0) { viewMonth = 11; viewYear--; }
		else viewMonth--;
	}

	function nextMonth() {
		if (viewMonth === 11) { viewMonth = 0; viewYear++; }
		else viewMonth++;
	}

	function selectDay(date: Date) {
		if (isDisabled(date)) return;
		popupManager.resolve(date);
	}

	function dayClass(date: Date): string {
		const outOfMonth = date.getMonth() !== viewMonth;
		const disabled = isDisabled(date);
		const isSelected = value ? isSameDay(date, value) : false;
		const isToday = isSameDay(date, today);

		return twMerge(
			'h-8 w-8 rounded-control text-sm flex items-center justify-center transition-colors',
			outOfMonth && 'text-muted-contrast',
			disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
			isSelected && 'bg-accent text-accent-contrast font-semibold',
			!isSelected && isToday && 'ring-1 ring-accent text-accent',
			!disabled && !isSelected && 'hover:bg-secondary cursor-pointer',
		);
	}

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') popupManager.close();
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<Card class="p-3 w-72">
	<!-- Header -->
	<div class="flex items-center justify-between mb-3">
		<Button ghost compact icon={ChevronLeft} onclick={prevMonth}/>
		<span class="text-sm font-semibold text-canvas-contrast select-none">
			{MONTH_NAMES[viewMonth]} {viewYear}
		</span>
		<Button ghost compact icon={ChevronRight} onclick={nextMonth}/>
	</div>

	<!-- Weekday headers -->
	<div class="grid grid-cols-7 mb-1">
		{#each weekHeaders as day}
			<div class="h-8 flex items-center justify-center text-xs font-medium text-muted-contrast select-none">
				{day}
			</div>
		{/each}
	</div>

	<!-- Day grid -->
	<div class="grid grid-cols-7 gap-0.5">
		{#each calendarDays as date}
			<button
				type="button"
				class={dayClass(date)}
				onclick={() => selectDay(date)}
				disabled={isDisabled(date)}
			>
				{date.getDate()}
			</button>
		{/each}
	</div>
</Card>
