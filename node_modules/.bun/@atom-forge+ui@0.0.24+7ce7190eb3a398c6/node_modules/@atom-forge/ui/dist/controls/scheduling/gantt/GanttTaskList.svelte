<script lang="ts">
	import { getGanttContext, ROW_HEIGHT, HEADER_HEIGHT, TASK_LIST_WIDTH } from './gantt.svelte';
	import GanttTaskItem from './GanttTaskItem.svelte';

	let { scrollTop = $bindable(0) }: { scrollTop?: number } = $props();

	let ctx = getGanttContext();
	let el = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (el && el.scrollTop !== scrollTop) {
			el.scrollTop = scrollTop;
		}
	});
</script>

<div
	class="shrink-0 flex flex-col border-r border-frame bg-canvas"
	style="width: {TASK_LIST_WIDTH}px"
>
	<!-- Header matching timeline header height -->
	<div
		class="shrink-0 flex items-end px-3 pb-2 border-b border-frame bg-canvas font-medium text-xs text-muted-contrast uppercase tracking-wider"
		style="height: {HEADER_HEIGHT}px"
	>
		Task
	</div>

	<!-- Rows -->
	<div
		bind:this={el}
		class="overflow-y-auto overflow-x-hidden flex-1"
		onscroll={() => { if (el) scrollTop = el.scrollTop; }}
	>
		<div style="min-height: {ctx.flatTasks.length * ROW_HEIGHT}px">
			{#each ctx.flatTasks as flat (flat.task.id)}
				<GanttTaskItem {flat} />
			{/each}
		</div>
	</div>
</div>
