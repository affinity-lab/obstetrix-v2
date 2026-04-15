<script lang="ts">
	import Chart from './Chart.svelte';
	import { getChartTheme, seriesColor } from './theme.js';
	import type { ScatterDataset } from './types.js';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import type { Chart as ChartJS } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';

	let {
		datasets,
		options = {},
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		datasets: ScatterDataset[];
		options?: ChartOptions<'scatter'>;
		chart?: ChartJS | undefined;
	} = $props();

	let darkSignal = $state(0);

	$effect(() => {
		const obs = new MutationObserver(() => darkSignal++);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => obs.disconnect();
	});

	const config = $derived.by((): ChartConfiguration<'scatter'> => {
		darkSignal;
		const theme = getChartTheme();
		const { plugins: userPlugins, scales: userScales, ...restOptions } = options as any;

		return {
			type: 'scatter',
			data: {
				datasets: datasets.map((ds, i) => {
					const color = seriesColor(i, ds.color);
					return {
						label: ds.label,
						data: ds.data,
						backgroundColor: color + '99',
						borderColor: color,
						pointRadius: 6,
						pointHoverRadius: 8,
					};
				}),
			},
			options: {
				responsive: true,
				...restOptions,
				plugins: {
					legend: { labels: { color: theme.text } },
					...userPlugins,
				},
				scales: {
					x: { ticks: { color: theme.text }, grid: { color: theme.grid }, ...(userScales?.x ?? {}) },
					y: { ticks: { color: theme.text }, grid: { color: theme.grid }, ...(userScales?.y ?? {}) },
				},
			},
		};
	});
</script>

<Chart {config} class={classes} bind:chart />
