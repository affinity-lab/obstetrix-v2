<script lang="ts">
	import { ChevronLeft, ChevronRight, CalendarDays, ZoomIn, ZoomOut } from 'lucide-svelte';
	import { getRMContext } from './rm.svelte';
	import { MONTH_NAMES } from '../gantt/gantt-utils';

	let ctx = getRMContext();

	const rangeLabel = $derived.by(() => {
		const s = ctx.rangeStart;
		const e = ctx.rangeEnd;
		if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
			return `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`;
		}
		return `${MONTH_NAMES[s.getMonth()]} – ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`;
	});

	const span = $derived(Math.round((ctx.rangeEnd.getTime() - ctx.rangeStart.getTime()) / 86_400_000));

	function setSpan(days: number) {
		ctx.setSpan(days);
	}
</script>

<div class="flex items-center gap-1 px-3 py-2 border-b border-frame bg-canvas shrink-0 flex-wrap gap-y-1">
	<!-- Date navigation -->
	<button
		type="button"
		onclick={() => ctx.shiftRange(-span)}
		class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
		title="Previous period"
	>
		<ChevronLeft size={15} />
	</button>
	<span class="text-sm font-medium text-canvas-contrast min-w-28 text-center">{rangeLabel}</span>
	<button
		type="button"
		onclick={() => ctx.shiftRange(span)}
		class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
		title="Next period"
	>
		<ChevronRight size={15} />
	</button>

	<div class="w-px h-5 bg-frame mx-1"></div>

	<!-- Span presets -->
	{#each [[14, '2W'], [30, '1M'], [60, '2M'], [90, '3M']] as [days, label]}
		<button
			type="button"
			onclick={() => setSpan(parseInt(days.toString()))}
			class="px-2 py-1 text-xs rounded transition-colors {span === days ? 'use-accent' : 'hover:bg-secondary text-canvas-contrast'}"
		>
			{label}
		</button>
	{/each}

	<div class="w-px h-5 bg-frame mx-1"></div>

	<button
		type="button"
		onclick={() => ctx.goToToday()}
		class="flex items-center gap-1 p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors text-xs"
	>
		<CalendarDays size={15} />
		Today
	</button>

	<div class="w-px h-5 bg-frame mx-1"></div>

	<button type="button" onclick={() => ctx.zoomOut()} title="Zoom out" class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors">
		<ZoomOut size={15} />
	</button>
	<button type="button" onclick={() => ctx.zoomIn()} title="Zoom in" class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors">
		<ZoomIn size={15} />
	</button>

	<!-- Active project picker -->
	{#if !ctx.viewOnly && ctx.projects.length > 0}
		<div class="w-px h-5 bg-frame mx-1"></div>
		<div class="flex items-center gap-2">
			<span class="text-xs text-muted-contrast">Project:</span>
			<select
				class="text-xs rounded border border-frame bg-control text-canvas-contrast px-2 py-1"
				value={ctx.activeProjectId ?? ''}
				onchange={(e) => { ctx.activeProjectId = (e.currentTarget).value || null; }}
			>
				<option value="">— pick —</option>
				{#each ctx.projects as project}
					<option value={project.id}>{project.name}</option>
				{/each}
			</select>
			{#if ctx.activeProjectId}
				{@const proj = ctx.projectById(ctx.activeProjectId)}
				{#if proj}
					<div class="w-3 h-3 rounded-full shrink-0" style="background-color: {proj.color ?? 'var(--color-accent)'}"></div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
