<script lang="ts">
	import { getRMContext, LANE_H, ROW_PAD } from './rm.svelte';
	import { parseDate, formatDate, addDays } from '../gantt/gantt-utils';
	import type { LanedAllocation } from './rm.types';
	import { twMerge } from 'tailwind-merge';

	let {
		laned,
		rowOffsetY,
	}: {
		laned: LanedAllocation;
		rowOffsetY: number;
	} = $props();

	let ctx = getRMContext();

	const { alloc, lane } = $derived(laned);
	const project = $derived(ctx.projectById(alloc.projectId));

	const BAR_H = LANE_H - 4;

	const bar = $derived.by(() => {
		const x = ctx.dateToX(alloc.startDate);
		const endX = ctx.dateToX(alloc.endDate) + ctx.dayWidth;
		const w = Math.max(ctx.dayWidth, endX - x);
		const y = rowOffsetY + ROW_PAD / 2 + lane * LANE_H + (LANE_H - BAR_H) / 2;
		return { x, y, w };
	});

	const dragging = $derived(
		ctx.drag !== null && 'allocId' in ctx.drag && ctx.drag.allocId === alloc.id ? ctx.drag : null
	);

	const barColor = $derived(project?.color ?? 'var(--color-accent)');

	function onMoveStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = { type: 'move', allocId: alloc.id, startX: e.clientX, originalStart: alloc.startDate, originalEnd: alloc.endDate };
	}

	function onResizeLeftStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = { type: 'resize-left', allocId: alloc.id, startX: e.clientX, originalStart: alloc.startDate, originalEnd: alloc.endDate };
	}

	function onResizeRightStart(e: PointerEvent) {
		if (ctx.viewOnly) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		ctx.drag = { type: 'resize-right', allocId: alloc.id, startX: e.clientX, originalStart: alloc.startDate, originalEnd: alloc.endDate };
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || !('allocId' in dragging)) return;
		const dx = e.clientX - dragging.startX;
		const dayDelta = Math.round(dx / ctx.dayWidth);

		if (dragging.type === 'move') {
			const newStart = formatDate(addDays(parseDate(dragging.originalStart), dayDelta));
			const newEnd = formatDate(addDays(parseDate(dragging.originalEnd), dayDelta));
			ctx.updateAllocation(alloc.id, { startDate: newStart, endDate: newEnd });
		} else if (dragging.type === 'resize-right') {
			const newEnd = addDays(parseDate(dragging.originalEnd), dayDelta);
			if (newEnd > parseDate(dragging.originalStart)) {
				ctx.updateAllocation(alloc.id, { endDate: formatDate(newEnd) });
			}
		} else if (dragging.type === 'resize-left') {
			const newStart = addDays(parseDate(dragging.originalStart), dayDelta);
			if (newStart < parseDate(dragging.originalEnd)) {
				ctx.updateAllocation(alloc.id, { startDate: formatDate(newStart) });
			}
		}
	}

	function onPointerUp() {
		if (!dragging) return;
		ctx.drag = null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={twMerge(
		'absolute rounded flex items-center overflow-hidden group',
		!ctx.viewOnly && 'cursor-grab active:cursor-grabbing',
		dragging && 'ring-2 ring-white/40 z-10',
	)}
	style="left: {bar.x}px; top: {bar.y}px; width: {bar.w}px; height: {BAR_H}px; background-color: {barColor}; opacity: 0.85"
	onpointerdown={onMoveStart}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
>
	<!-- Resize left -->
	{#if !ctx.viewOnly}
		<div class="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-black/20 z-10 rounded-l" onpointerdown={onResizeLeftStart}></div>
	{/if}

	<span class="relative px-2 text-white text-[11px] font-medium truncate pointer-events-none select-none">
		{project?.name ?? alloc.projectId}
	</span>

	<!-- Delete button -->
	{#if !ctx.viewOnly}
		<button
			type="button"
			class="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-3.5 h-3.5 rounded-full bg-black/30 hover:bg-black/50 text-white text-[9px] flex items-center justify-center transition-opacity z-10"
			onclick={(e) => { e.stopPropagation(); ctx.deleteAllocation(alloc.id); }}
			onpointerdown={(e) => e.stopPropagation()}
		>✕</button>
	{/if}

	<!-- Resize right -->
	{#if !ctx.viewOnly}
		<div class="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-black/20 z-10 rounded-r" onpointerdown={onResizeRightStart}></div>
	{/if}
</div>
