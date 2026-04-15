<script lang="ts">
	import { getGanttContext, ROW_HEIGHT } from './gantt.svelte';
	import { parseDate, daysBetween } from './gantt-utils';

	let ctx = getGanttContext();

	const BAR_H = 24;
	const barMidY = (rowIndex: number) => rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_H) / 2 + BAR_H / 2;

	const lines = $derived.by(() => {
		const flat = ctx.flatTasks;
		const rowMap = new Map(flat.map(f => [f.task.id, f]));
		const result: { x1: number; y1: number; x2: number; y2: number }[] = [];

		for (const f of flat) {
			if (!f.task.dependencies) continue;
			for (const depId of f.task.dependencies) {
				const dep = rowMap.get(depId);
				if (!dep) continue;
				// Dependency: dep ends → task starts
				const x1 = ctx.dateToX(dep.task.endDate) + ctx.dayWidth;
				const y1 = barMidY(dep.index);
				const x2 = ctx.dateToX(f.task.startDate);
				const y2 = barMidY(f.index);
				result.push({ x1, y1, x2, y2 });
			}
		}
		return result;
	});
</script>

<svg
	class="absolute inset-0 pointer-events-none"
	style="width: {ctx.totalWidth}px; height: {ctx.flatTasks.length * ROW_HEIGHT}px"
	overflow="visible"
>
	{#each lines as line}
		{@const midX = (line.x1 + line.x2) / 2}
		<path
			d="M {line.x1} {line.y1} C {line.x1 + 20} {line.y1}, {line.x2 - 20} {line.y2}, {line.x2} {line.y2}"
			fill="none"
			stroke="var(--color-muted-contrast)"
			stroke-width="1.5"
			stroke-dasharray="4 3"
			marker-end="url(#gantt-arrow)"
		/>
	{/each}

	{#if lines.length > 0}
		<defs>
			<marker id="gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
				<path d="M 0 0 L 6 3 L 0 6 Z" fill="var(--color-muted-contrast)" />
			</marker>
		</defs>
	{/if}
</svg>
