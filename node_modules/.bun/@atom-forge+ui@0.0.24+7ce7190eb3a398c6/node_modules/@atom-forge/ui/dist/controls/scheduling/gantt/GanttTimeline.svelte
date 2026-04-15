<script lang="ts">
	import { getGanttContext, ROW_HEIGHT, HEADER_HEIGHT } from './gantt.svelte';
	import GanttTimelineHeader from './GanttTimelineHeader.svelte';
	import GanttTaskBar from './GanttTaskBar.svelte';
	import GanttDependencyLines from './GanttDependencyLines.svelte';
	import { addDays, isRestDay } from './gantt-utils';
	import { twMerge } from 'tailwind-merge';

	let { scrollTop = $bindable(0) }: { scrollTop?: number } = $props();

	let ctx = getGanttContext();
	let el = $state<HTMLDivElement | undefined>();

	$effect(() => {
		// Sync scroll from task list
		if (el && el.scrollTop !== scrollTop) {
			el.scrollTop = scrollTop;
		}
	});

	// Scroll to today on toolbar event
	$effect(() => {
		function handler(e: Event) {
			const ce = e as CustomEvent<{ x: number }>;
			if (el) {
				el.scrollLeft = Math.max(0, ce.detail.x - el.clientWidth / 2);
			}
		}
		document.addEventListener('gantt:scroll-to-today', handler);
		return () => document.removeEventListener('gantt:scroll-to-today', handler);
	});

	// Build weekend/rest columns for visual background
	const restColumns = $derived.by(() => {
		const cols: { x: number }[] = [];
		for (let i = 0; i < ctx.totalDays; i++) {
			const d = addDays(ctx.bounds.start, i);
			if (isRestDay(d, ctx.workdays, ctx.extraRest, ctx.extraWork)) {
				cols.push({ x: i * ctx.dayWidth });
			}
		}
		return cols;
	});

	const todayX = $derived(ctx.todayX());
	const gridH = $derived(ctx.flatTasks.length * ROW_HEIGHT);
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<!-- Scrollable area -->
	<div
		bind:this={el}
		class="flex-1 overflow-auto"
		onscroll={() => {
			if (el) scrollTop = el.scrollTop;
		}}
	>
		<!-- Inner: fixed-width column -->
		<div style="width: {ctx.totalWidth}px; min-width: 100%">
			<!-- Sticky header -->
			<div class="sticky top-0 z-20">
				<GanttTimelineHeader />
			</div>

			<!-- Grid body -->
			<div class="relative" style="height: {gridH}px; width: {ctx.totalWidth}px">
				<!-- Vertical day grid lines -->
				{#if ctx.dayWidth >= 20}
					{#each { length: ctx.totalDays } as _, i}
						<div
							class="absolute top-0 bottom-0 border-r border-frame/50"
							style="left: {(i + 1) * ctx.dayWidth - 1}px; width: 1px"
						></div>
					{/each}
				{/if}

				<!-- Horizontal row stripes -->
				{#each ctx.flatTasks as _, i}
					{#if i % 2 === 1}
						<div
							class="absolute left-0 right-0 bg-canvas/50"
							style="top: {i * ROW_HEIGHT}px; height: {ROW_HEIGHT}px"
						></div>
					{/if}
					<!-- Row bottom border -->
					<div
						class="absolute left-0 right-0 border-b border-frame/40"
						style="top: {(i + 1) * ROW_HEIGHT - 1}px; height: 1px"
					></div>
				{/each}

				<!-- Rest day columns -->
				{#each restColumns as col}
					<div
						class="absolute top-0 bottom-0 bg-muted/30"
						style="left: {col.x}px; width: {ctx.dayWidth}px"
					></div>
				{/each}

				<!-- Today marker -->
				{#if todayX >= 0 && todayX <= ctx.totalWidth}
					<div
						class="absolute top-0 bottom-0 w-0.5 bg-accent/60 z-10"
						style="left: {todayX}px"
					>
						<div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent"></div>
					</div>
				{/if}

				<!-- Dependency lines -->
				<GanttDependencyLines />

				<!-- Task bars -->
				{#each ctx.flatTasks as flat (flat.task.id)}
					<GanttTaskBar {flat} />
				{/each}
			</div>
		</div>
	</div>
</div>
