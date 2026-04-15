<script lang="ts">
	import { createRMContext } from './rm.svelte';
	import RMToolbar from './RMToolbar.svelte';
	import RMResourceList from './RMResourceList.svelte';
	import RMTimeline from './RMTimeline.svelte';
	import type { RMResource, RMProject, RMAllocation } from './rm.types';
	import { parseDate, addDays } from '../gantt/gantt-utils';
	import { twMerge } from 'tailwind-merge';
	import { untrack } from 'svelte';


	let {
		resources = [],
		projects = [],
		allocations = [],
		viewOnly = false,
		workdays = '12345',
		extraRest = [],
		extraWork = [],
		rangeStart,
		rangeEnd,
		class: classes,
		onchange,
	}: {
		resources?: RMResource[];
		projects?: RMProject[];
		allocations?: RMAllocation[];
		viewOnly?: boolean;
		workdays?: string;
		extraRest?: string[];
		extraWork?: string[];
		rangeStart?: string;
		rangeEnd?: string;
		class?: string;
		onchange?: (allocations: RMAllocation[]) => void;
	} = $props();

	const ctx = createRMContext();

	untrack(() => {
		ctx.resources = resources;
		ctx.projects = projects;
		ctx.allocations = allocations;
		ctx.viewOnly = viewOnly;
		ctx.workdays = workdays;
		ctx.extraRest = extraRest;
		ctx.extraWork = extraWork;
		ctx.activeProjectId = projects[0]?.id ?? null;

		if (rangeStart) ctx.rangeStart = parseDate(rangeStart);
		else ctx.goToToday();

		if (rangeEnd) ctx.rangeEnd = parseDate(rangeEnd);
		else ctx.rangeEnd = addDays(ctx.rangeStart, 30);
	});

	$effect(() => { ctx.viewOnly = viewOnly; });
	$effect(() => { ctx.resources = resources; });
	$effect(() => { ctx.projects = projects; });

	$effect(() => {
		const _ = ctx.allocations;
		onchange?.(ctx.allocations);
	});

	let scrollTop = $state(0);
</script>

<div class={twMerge('flex flex-col border border-frame rounded-lg overflow-hidden bg-canvas', classes)}>
	<RMToolbar />
	<div class="flex flex-1 overflow-hidden">
		<RMResourceList bind:scrollTop />
		<RMTimeline bind:scrollTop />
	</div>
</div>
