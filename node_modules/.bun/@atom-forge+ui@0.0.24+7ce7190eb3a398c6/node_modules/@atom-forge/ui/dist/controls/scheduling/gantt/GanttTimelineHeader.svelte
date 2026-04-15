<script lang="ts">
	import { getGanttContext, HEADER_HEIGHT } from './gantt.svelte';
	import { addDays, isRestDay, MONTH_NAMES } from './gantt-utils';
	import { twMerge } from 'tailwind-merge';

	let ctx = getGanttContext();

	// Build month spans for top header row
	const monthSpans = $derived.by(() => {
		const spans: { label: string; width: number; x: number }[] = [];
		const start = ctx.bounds.start;
		const total = ctx.totalDays;
		let i = 0;
		while (i < total) {
			const d = addDays(start, i);
			const m = d.getMonth();
			const y = d.getFullYear();
			let count = 1;
			while (i + count < total) {
				const next = addDays(start, i + count);
				if (next.getMonth() !== m) break;
				count++;
			}
			spans.push({
				label: `${MONTH_NAMES[m]} ${y}`,
				width: count * ctx.dayWidth,
				x: i * ctx.dayWidth,
			});
			i += count;
		}
		return spans;
	});

	// Days for bottom row
	const days = $derived.by(() => {
		const result: { label: string; x: number; isRest: boolean; isToday: boolean }[] = [];
		const start = ctx.bounds.start;
		const todayStr = new Date().toDateString();
		for (let i = 0; i < ctx.totalDays; i++) {
			const d = addDays(start, i);
			const rest = isRestDay(d, ctx.workdays, ctx.extraRest, ctx.extraWork);
			result.push({
				label: String(d.getDate()),
				x: i * ctx.dayWidth,
				isRest: rest,
				isToday: d.toDateString() === todayStr,
			});
		}
		return result;
	});

	const topRowH = 28;
	const bottomRowH = HEADER_HEIGHT - topRowH;
</script>

<div
	class="relative shrink-0 border-b border-frame bg-canvas overflow-hidden"
	style="height: {HEADER_HEIGHT}px; width: {ctx.totalWidth}px"
>
	<!-- Month row -->
	<div class="absolute inset-x-0 top-0" style="height: {topRowH}px">
		{#each monthSpans as span}
			<div
				class="absolute top-0 h-full flex items-center px-2 border-r border-frame text-xs font-semibold text-canvas-contrast"
				style="left: {span.x}px; width: {span.width}px"
			>
				{span.label}
			</div>
		{/each}
	</div>

	<!-- Day row -->
	{#if ctx.dayWidth >= 20}
		<div class="absolute inset-x-0 border-t border-frame" style="top: {topRowH}px; height: {bottomRowH}px">
			{#each days as day}
				<div
					class={twMerge(
						'absolute top-0 h-full flex items-center justify-center border-r border-frame text-[10px]',
						day.isRest ? 'text-muted-contrast bg-muted/40' : 'text-canvas-contrast',
						day.isToday && 'font-bold text-accent',
					)}
					style="left: {day.x}px; width: {ctx.dayWidth}px"
				>
					{day.label}
				</div>
			{/each}
		</div>
	{/if}
</div>
