<script lang="ts">
	import { Card } from '../../display/card';
	import { Button } from '../../general/button';
	import { getPopupManager } from '../../overlays/popup';
	import { ChevronUp, ChevronDown } from 'lucide-svelte';
	import { untrack } from 'svelte';

	type RoundProp = false | 0 | 5 | 10 | 15 | 20 | 30 | number[];

	let {
		value,
		seconds = false,
		round = false,
	}: {
		value?: string | null;
		seconds?: boolean;
		round?: RoundProp;
	} = $props();

	const popupManager = getPopupManager();

	function pad(n: number) { return String(n).padStart(2, '0'); }

	const initial = untrack(() => {
		if (!value) return { h: 0, m: 0, s: 0 };
		const [h, m, s] = value.split(':').map(Number);
		return { h: h ?? 0, m: m ?? 0, s: s ?? 0 };
	});

	let hour   = $state(initial.h);
	let minute = $state(initial.m);
	let second = $state(initial.s);

	// ── minute options (respects round prop) ──────────────────────────────────

	const minuteOptions = $derived.by((): number[] | null => {
		if (round === false) return null;
		if (Array.isArray(round)) return [...round].filter(m => m >= 0 && m < 60).sort((a, b) => a - b);
		if (round === 0) return [0];
		const opts: number[] = [];
		for (let i = 0; i < 60; i += round) opts.push(i);
		return opts;
	});

	function snapMinute(m: number): number {
		if (!minuteOptions) return Math.max(0, Math.min(59, m));
		return minuteOptions.reduce((prev, cur) =>
			Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev
		);
	}

	// ── increment / decrement ─────────────────────────────────────────────────

	function hourUp()   { hour = (hour + 1) % 24; }
	function hourDown() { hour = (hour - 1 + 24) % 24; }

	function minuteUp() {
		if (!minuteOptions) {
			if (minute === 59) { minute = 0; hourUp(); } else minute++;
		} else {
			const idx = minuteOptions.indexOf(minute);
			if (idx < 0 || idx === minuteOptions.length - 1) { minute = minuteOptions[0]; hourUp(); }
			else minute = minuteOptions[idx + 1];
		}
	}

	function minuteDown() {
		if (!minuteOptions) {
			if (minute === 0) { minute = 59; hourDown(); } else minute--;
		} else {
			const idx = minuteOptions.indexOf(minute);
			if (idx <= 0) { minute = minuteOptions[minuteOptions.length - 1]; hourDown(); }
			else minute = minuteOptions[idx - 1];
		}
	}

	function secondUp()   { second = (second + 1) % 60; }
	function secondDown() { second = (second - 1 + 60) % 60; }

	// ── confirm / cancel ──────────────────────────────────────────────────────

	function confirm() {
		const time = seconds
			? `${pad(hour)}:${pad(minute)}:${pad(second)}`
			: `${pad(hour)}:${pad(minute)}`;
		popupManager.resolve(time);
	}

	// ── input class ───────────────────────────────────────────────────────────

	const inputClass = 'w-12 h-11 text-center text-lg font-semibold font-mono tabular-nums bg-secondary rounded-control focus:outline-none focus:ring-2 focus:ring-accent text-canvas-contrast cursor-default select-none';
	const btnClass   = 'flex items-center justify-center w-8 h-7 rounded text-muted-contrast hover:text-canvas-contrast hover:bg-secondary transition-colors';
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') popupManager.close();
		if (e.key === 'Enter') confirm();
	}}
/>

<Card class="p-4 select-none">
	<div class="flex items-start justify-center gap-1">

		{#snippet spinCol(label: string, val: number, onUp: () => void, onDown: () => void, setVal: (n: number) => void)}
			<div class="flex flex-col items-center gap-1">
				<button type="button" class={btnClass} onclick={onUp} tabindex="-1">
					<ChevronUp size={16} />
				</button>
				<input
					type="text"
					inputmode="numeric"
					class={inputClass}
					value={pad(val)}
					onfocus={(e) => (e.currentTarget as HTMLInputElement).select()}
					onblur={(e) => {
						const n = parseInt((e.currentTarget as HTMLInputElement).value, 10);
						if (!isNaN(n)) setVal(n);
						(e.currentTarget as HTMLInputElement).value = pad(val);
					}}
					onkeydown={(e) => {
						if (e.key === 'ArrowUp')   { e.preventDefault(); onUp(); }
						if (e.key === 'ArrowDown') { e.preventDefault(); onDown(); }
					}}
					onwheel={(e) => { e.preventDefault(); e.deltaY < 0 ? onUp() : onDown(); }}
				/>
				<button type="button" class={btnClass} onclick={onDown} tabindex="-1">
					<ChevronDown size={16} />
				</button>
				<span class="text-[11px] text-muted-contrast uppercase tracking-wide">{label}</span>
			</div>
		{/snippet}

		{#snippet sep()}
			<span class="text-2xl font-bold text-muted-contrast mt-3 select-none">:</span>
		{/snippet}

		{@render spinCol('hr', hour, hourUp, hourDown, (n) => { hour = Math.max(0, Math.min(23, n)); })}
		{@render sep()}
		{@render spinCol('min', minute, minuteUp, minuteDown, (n) => { minute = snapMinute(n); })}
		{#if seconds}
			{@render sep()}
			{@render spinCol('sec', second, secondUp, secondDown, (n) => { second = Math.max(0, Math.min(59, n)); })}
		{/if}
	</div>

	<div class="mt-4 flex justify-end">
		<Button small accent onclick={confirm}>OK</Button>
	</div>
</Card>
