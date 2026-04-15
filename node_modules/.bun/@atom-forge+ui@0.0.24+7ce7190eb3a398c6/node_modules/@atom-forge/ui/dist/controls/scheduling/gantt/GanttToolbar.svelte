<script lang="ts">
	import { ZoomIn, ZoomOut, CalendarDays, Download, Upload, Undo2, Redo2, Plus } from 'lucide-svelte';
	import { getGanttContext } from './gantt.svelte';

	let ctx = getGanttContext();

	function downloadJSON() {
		const blob = new Blob([ctx.exportJSON()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'gantt.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function uploadJSON() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => ctx.importJSON(reader.result as string);
			reader.readAsText(file);
		};
		input.click();
	}
</script>

<div class="flex items-center gap-1 px-3 py-2 border-b border-frame bg-canvas shrink-0">
	{#if !ctx.viewOnly}
		<button
			type="button"
			onclick={() => ctx.addTask(null)}
			class="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium use-accent hover:opacity-90 transition-opacity"
		>
			<Plus size={13} />
			Add task
		</button>

		<div class="w-px h-5 bg-frame mx-1"></div>

		<button
			type="button"
			onclick={() => ctx.undo()}
			disabled={!ctx.canUndo}
			title="Undo"
			class="p-1.5 rounded hover:bg-secondary text-canvas-contrast disabled:opacity-30 transition-colors"
		>
			<Undo2 size={15} />
		</button>
		<button
			type="button"
			onclick={() => ctx.redo()}
			disabled={!ctx.canRedo}
			title="Redo"
			class="p-1.5 rounded hover:bg-secondary text-canvas-contrast disabled:opacity-30 transition-colors"
		>
			<Redo2 size={15} />
		</button>

		<div class="w-px h-5 bg-frame mx-1"></div>
	{/if}

	<button
		type="button"
		onclick={() => ctx.zoomOut()}
		title="Zoom out"
		class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
	>
		<ZoomOut size={15} />
	</button>
	<button
		type="button"
		onclick={() => ctx.zoomIn()}
		title="Zoom in"
		class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
	>
		<ZoomIn size={15} />
	</button>

	<div class="w-px h-5 bg-frame mx-1"></div>

	<button
		type="button"
		onclick={() => {
			const x = ctx.todayX();
			// dispatch to timeline — use a custom event
			document.dispatchEvent(new CustomEvent('gantt:scroll-to-today', { detail: { x } }));
		}}
		title="Go to today"
		class="flex items-center gap-1 p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors text-xs"
	>
		<CalendarDays size={15} />
		Today
	</button>

	<div class="ml-auto flex items-center gap-1">
		<button
			type="button"
			onclick={uploadJSON}
			title="Import JSON"
			class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
		>
			<Upload size={15} />
		</button>
		<button
			type="button"
			onclick={downloadJSON}
			title="Export JSON"
			class="p-1.5 rounded hover:bg-secondary text-canvas-contrast transition-colors"
		>
			<Download size={15} />
		</button>
	</div>
</div>
