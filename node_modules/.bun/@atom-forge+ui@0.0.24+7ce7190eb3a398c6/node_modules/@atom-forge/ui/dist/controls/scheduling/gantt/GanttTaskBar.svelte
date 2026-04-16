<script lang="ts">
	import { getGanttContext, ROW_HEIGHT } from './gantt.svelte';
	import { parseDate, daysBetween, formatDate, addDays } from './gantt-utils';
	import type { FlatTask } from './gantt.types';
	import { twMerge } from 'tailwind-merge';

	let { flat }: { flat: FlatTask } = $props();
	let ctx = getGanttContext();

	let { task } = $derived(flat);

	const BAR_H = 24;
	const bar = $derived.by(() => {
		const x = ctx.dateToX(task.startDate);
		const endX = ctx.dateToX(task.endDate) + ctx.dayWidth;
		const w = Math.max(ctx.dayWidth, endX - x);
		const y = flat.index * ROW_HEIGHT + (ROW_HEIGHT - BAR_H) / 2;
		return { x, y, w };
	});

	const barColor = $derived(task.color ?? 'var(--color-accent)');

	// Drag state (local, resolved against ctx.drag)
	let dragging = $derived(
		ctx.drag !== null && ctx.drag.taskId === task.id ? ctx.drag : null
	);

	function onMoveStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = {
			type: 'move',
			taskId: task.id,
			startX: e.clientX,
			originalStart: task.startDate,
			originalEnd: task.endDate,
		};
	}

	function onResizeRightStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = {
			type: 'resize-right',
			taskId: task.id,
			startX: e.clientX,
			originalStart: task.startDate,
			originalEnd: task.endDate,
		};
	}

	function onResizeLeftStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = {
			type: 'resize-left',
			taskId: task.id,
			startX: e.clientX,
			originalStart: task.startDate,
			originalEnd: task.endDate,
		};
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		const dx = e.clientX - dragging.startX;
		const dayDelta = Math.round(dx / ctx.dayWidth);

		if (dragging.type === 'move') {
			const origStart = parseDate(dragging.originalStart);
			const origEnd = parseDate(dragging.originalEnd);
			const dur = daysBetween(origStart, origEnd);
			const newStart = formatDate(addDays(origStart, dayDelta));
			const newEnd = formatDate(addDays(origEnd, dayDelta));
			ctx.updateTask(task.id, { startDate: newStart, endDate: newEnd });
		} else if (dragging.type === 'resize-right') {
			const origEnd = parseDate(dragging.originalEnd);
			const origStart = parseDate(dragging.originalStart);
			const newEnd = addDays(origEnd, dayDelta);
			if (newEnd > origStart) {
				ctx.updateTask(task.id, { endDate: formatDate(newEnd) });
			}
		} else if (dragging.type === 'resize-left') {
			const origStart = parseDate(dragging.originalStart);
			const origEnd = parseDate(dragging.originalEnd);
			const newStart = addDays(origStart, dayDelta);
			if (newStart < origEnd) {
				ctx.updateTask(task.id, { startDate: formatDate(newStart) });
			}
		}
	}

	function onPointerUp() {
		if (!dragging) return;
		ctx.snapshot();
		ctx.drag = null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={twMerge(
		'absolute rounded flex items-center overflow-hidden group',
		!ctx.viewOnly && 'cursor-grab active:cursor-grabbing',
		dragging && 'ring-2 ring-accent/60 z-10',
	)}
	style="left: {bar.x}px; top: {bar.y}px; width: {bar.w}px; height: {BAR_H}px; background-color: {barColor}; opacity: 0.9;"
	onpointerdown={onMoveStart}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
>
	<!-- Progress fill -->
	{#if task.progress && task.progress > 0}
		<div
			class="absolute inset-y-0 left-0 bg-black/20 rounded-l"
			style="width: {task.progress}%"
		></div>
	{/if}

	<!-- Resize left handle -->
	{#if !ctx.viewOnly}
		<div
			class="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-black/20 z-10 rounded-l"
			onpointerdown={onResizeLeftStart}
		></div>
	{/if}

	<!-- Label -->
	<span class="relative px-2 text-white text-xs font-medium truncate pointer-events-none select-none leading-none">
		{task.label}
		{#if task.progress !== undefined && task.progress > 0}
			<span class="opacity-70 ml-1">{task.progress}%</span>
		{/if}
	</span>

	<!-- Resize right handle -->
	{#if !ctx.viewOnly}
		<div
			class="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-black/20 z-10 rounded-r"
			onpointerdown={onResizeRightStart}
		></div>
	{/if}
</div>
