<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import type { ClassProp } from '../../../helpers/types';

	export type HeatmapData = {
		xLabels: string[];
		yLabels: string[];
		values: number[][];
	};

	export type HeatmapCell = {
		xLabel: string;
		yLabel: string;
		value: number;
		x: number;
		y: number;
	};

	let {
		data,
		colors = ['#f0f0f0', '#22c55e'],
		showLegend = false,
		legendTitle = '',
		cellSize = 16,
		cellPadding = 2,
		cellBorderRadius = 2,
		showRowLabels = true,
		showColLabels = false as boolean | 'vertical',
		class: classes,
		cellClass,
		tooltip,
		labelColor,
		labelBg,
		oncellClick,
		oncellHover,
	}: ClassProp & {
		data: HeatmapData;
		colors?: string[];
		showLegend?: boolean;
		legendTitle?: string;
		cellSize?: number;
		cellPadding?: number;
		cellBorderRadius?: number;
		showRowLabels?: boolean;
		showColLabels?: boolean | 'vertical';
		cellClass?: string;
		tooltip?: Snippet<[HeatmapCell]>;
		labelColor?: string;
		labelBg?: string;
		oncellClick?: (detail: HeatmapCell) => void;
		oncellHover?: (detail: HeatmapCell) => void;
	} = $props();

	// ── Color interpolation ───────────────────────────────────────────────────

	function hexToRgb(hex: string): [number, number, number] {
		hex = hex.replace('#', '');
		if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
		return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
	}

	function interpolateColor(t: number): string {
		const n = colors.length;
		if (n === 0) return '#ccc';
		if (n === 1) return colors[0];
		t = Math.max(0, Math.min(1, t));
		const scaled = t * (n - 1);
		const i = Math.min(Math.floor(scaled), n - 2);
		const f = scaled - i;
		const [r1, g1, b1] = hexToRgb(colors[i]);
		const [r2, g2, b2] = hexToRgb(colors[i + 1]);
		return `rgb(${Math.round(r1 + f * (r2 - r1))},${Math.round(g1 + f * (g2 - g1))},${Math.round(b1 + f * (b2 - b1))})`;
	}

	// ── Layout ────────────────────────────────────────────────────────────────

	const LEGEND_H = 36;

	const uid = $props.id();

	const allValues = $derived(data.values.flat());
	const minVal = $derived(allValues.length ? Math.min(...allValues) : 0);
	const maxVal = $derived(allValues.length ? Math.max(...allValues) : 1);

	function normalize(v: number): number {
		return minVal === maxVal ? 0.5 : (v - minVal) / (maxVal - minVal);
	}

	const maxYLabelLen = $derived(
		data.yLabels.length ? Math.max(...data.yLabels.map(l => l.length)) : 0
	);
	const yLabelRectW = $derived(maxYLabelLen * 6 + 12);
	const yLabelW = $derived(
		showRowLabels ? (labelBg ? yLabelRectW + 6 : 56) : 0
	);
	const maxXLabelLen = $derived(
		data.xLabels.length ? Math.max(...data.xLabels.map(l => l.length)) : 0
	);
	const xLabelH = $derived(
		showColLabels === false ? 0 :
		showColLabels === 'vertical' ? maxXLabelLen * 6 + 8 : 18
	);

	const xCount = $derived(data.xLabels.length);
	const yCount = $derived(data.yLabels.length);
	const gridW = $derived(xCount * (cellSize + cellPadding) - cellPadding);
	const gridH = $derived(yCount * (cellSize + cellPadding) - cellPadding);
	const svgW = $derived(yLabelW + 4 + gridW + 4);
	const svgH = $derived(xLabelH + 4 + gridH + 4 + (showLegend ? LEGEND_H + 8 : 0));
	const gridX = $derived(yLabelW + 4);
	const gridY = $derived(xLabelH + 4);

	// ── Interaction ───────────────────────────────────────────────────────────

	let container = $state<HTMLDivElement | undefined>();
	let hoveredCell = $state<HeatmapCell | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);

	function onMouseMove(e: MouseEvent) {
		if (!container) return;
		const rect = container.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}

	function makeCell(xi: number, yi: number): HeatmapCell {
		return {
			xLabel: data.xLabels[xi] ?? '',
			yLabel: data.yLabels[yi] ?? '',
			value: data.values[yi]?.[xi] ?? 0,
			x: xi,
			y: yi,
		};
	}
</script>

<div
	bind:this={container}
	class="relative w-full"
	onmousemove={onMouseMove}
	role="group"
	aria-label="Heatmap interactive area"
>
	<svg
		role="img"
		aria-label="Heatmap"
		viewBox="0 0 {svgW} {svgH}"
		style="color: var(--color-muted-contrast)"
		class={twMerge('w-full', classes)}
		onmouseleave={() => (hoveredCell = null)}
	>
		<defs>
			<linearGradient id="hm-lg-{uid}" x1="0" x2="1" y1="0" y2="0">
				{#each colors as color, i}
					<stop offset="{(colors.length > 1 ? i / (colors.length - 1) : 1) * 100}%" stop-color={color} />
				{/each}
			</linearGradient>
		</defs>

		<!-- X-axis labels -->
		{#if showColLabels !== false}
			{#each data.xLabels as label, xi}
				{@const cx = gridX + xi * (cellSize + cellPadding) + cellSize / 2}
				{#if showColLabels === 'vertical'}
					{#if labelBg}
						<rect
							x={cx - cellSize / 2}
							y={4}
							width={cellSize}
							height={xLabelH - 8}
							rx={cellBorderRadius}
							fill={labelBg}
						/>
					{/if}
					<text
						transform="translate({cx}, {gridY - 4}) rotate(-90)"
						text-anchor="start"
						dominant-baseline="middle"
						font-size="10"
						fill={labelColor ?? 'currentColor'}
					>{label}</text>
				{:else}
					{#if labelBg}
						<rect
							x={cx - cellSize / 2}
							y={2}
							width={cellSize}
							height={xLabelH - 4}
							rx={cellBorderRadius}
							fill={labelBg}
						/>
					{/if}
					<text
						x={cx}
						y={labelBg ? 2 + (xLabelH - 4) / 2 : xLabelH - 4}
						text-anchor="middle"
						dominant-baseline={labelBg ? 'middle' : 'auto'}
						font-size="10"
						fill={labelColor ?? 'currentColor'}
					>{label}</text>
				{/if}
			{/each}
		{/if}

		<!-- Y-axis labels -->
		{#if showRowLabels}
			{#each data.yLabels as label, yi}
				{@const ry = gridY + yi * (cellSize + cellPadding)}
				{#if labelBg}
					<rect
						x={0}
						y={ry}
						width={yLabelRectW}
						height={cellSize}
						rx={cellBorderRadius}
						fill={labelBg}
					/>
				{/if}
				<text
					x={labelBg ? yLabelRectW / 2 : yLabelW - 4}
					y={ry + cellSize / 2}
					text-anchor={labelBg ? 'middle' : 'end'}
					dominant-baseline="middle"
					font-size="10"
					fill={labelColor ?? 'currentColor'}
				>{label}</text>
			{/each}
		{/if}

		<!-- Cells -->
		{#each data.yLabels as _, yi}
			{#each data.xLabels as _, xi}
				{@const cell = makeCell(xi, yi)}
				{@const t = normalize(cell.value)}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<rect
					x={gridX + xi * (cellSize + cellPadding)}
					y={gridY + yi * (cellSize + cellPadding)}
					width={cellSize}
					height={cellSize}
					rx={cellBorderRadius}
					fill={interpolateColor(t)}
					tabindex="0"
					role="gridcell"
					aria-label="{cell.xLabel}, {cell.yLabel}: {cell.value}"
					aria-describedby="heatmap-tooltip-{uid}"
					class={twMerge('cursor-pointer', cellClass)}
					onmouseenter={() => { hoveredCell = cell; oncellHover?.(cell); }}
					onclick={() => oncellClick?.(cell)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							oncellClick?.(cell);
						}
					}}
				/>
			{/each}
		{/each}

		<!-- Legend -->
		{#if showLegend}
			{@const ly = gridY + gridH + 16}
			{#if legendTitle}
				<text x={gridX} y={ly - 6} font-size="10" fill={labelColor ?? 'currentColor'}>{legendTitle}</text>
			{/if}
			<rect x={gridX} y={ly} width={gridW} height={12} rx={2} fill="url(#hm-lg-{uid})" />
			<text x={gridX} y={ly + 24} font-size="10" fill={labelColor ?? 'currentColor'}>{minVal}</text>
			<text x={gridX + gridW} y={ly + 24} font-size="10" text-anchor="end" fill={labelColor ?? 'currentColor'}>{maxVal}</text>
		{/if}
	</svg>

	<!-- Tooltip -->
	{#if hoveredCell}
		{@const tipX = Math.min(mouseX + 12, (container?.offsetWidth ?? 300) - 150)}
		{@const tipY = mouseY + 12}
		<div
			id="heatmap-tooltip-{uid}"
			class="absolute z-10 pointer-events-none"
			style="left: {tipX}px; top: {tipY}px"
		>
			{#if tooltip}
				{@render tooltip(hoveredCell)}
			{:else}
				<div class="bg-surface border border-frame rounded-surface shadow-lg px-3 py-2 text-sm min-w-[120px]">
					<div class="font-medium text-canvas-contrast">{hoveredCell.yLabel}, {hoveredCell.xLabel}</div>
					<div class="text-muted-contrast text-xs mt-0.5">{hoveredCell.value}</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	rect:focus-visible {
		outline: none;
		stroke: var(--color-accent);
		stroke-width: 2;
	}
</style>