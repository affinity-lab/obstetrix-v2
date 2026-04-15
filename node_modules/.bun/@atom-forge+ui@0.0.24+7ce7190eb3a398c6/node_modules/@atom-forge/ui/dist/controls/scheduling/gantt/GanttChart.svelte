<script lang="ts">
	import { createGanttContext, TASK_LIST_WIDTH } from './gantt.svelte';
	import GanttToolbar from './GanttToolbar.svelte';
	import GanttTaskList from './GanttTaskList.svelte';
	import GanttTimeline from './GanttTimeline.svelte';
	import type { GanttTask } from './gantt.types';
	import { twMerge } from 'tailwind-merge';
	import { untrack } from 'svelte';

	let {
		tasks = $bindable([]),
		viewOnly = false,
		workdays = '12345',
		extraRest = [],
		extraWork = [],
		class: classes,
		onchange,
	}: {
		tasks?: GanttTask[];
		viewOnly?: boolean;
		workdays?: string;
		extraRest?: string[];
		extraWork?: string[];
		class?: string;
		onchange?: (tasks: GanttTask[]) => void;
	} = $props();

	const ctx = createGanttContext();

	// Init once with provided tasks
	untrack(() => {
		ctx.viewOnly = viewOnly;
		ctx.workdays = workdays;
		ctx.extraRest = extraRest;
		ctx.extraWork = extraWork;
		ctx.init(tasks);
	});

	// Keep viewOnly in sync
	$effect(() => { ctx.viewOnly = viewOnly; });

	// Notify parent of changes
	$effect(() => {
		const _ = ctx.tasks; // track
		onchange?.(ctx.tasks);
	});

	let scrollTop = $state(0);
</script>

<div class={twMerge('flex flex-col border border-frame rounded-lg overflow-hidden bg-canvas', classes)}>
	<GanttToolbar />
	<div class="flex flex-1 overflow-hidden">
		<GanttTaskList bind:scrollTop />
		<GanttTimeline bind:scrollTop />
	</div>
</div>
