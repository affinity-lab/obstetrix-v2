<script lang="ts">
	import Chart from './Chart.svelte';
	import { getChartTheme, seriesColor } from './theme.js';
	import type { LineDataset } from './types.js';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import type { Chart as ChartJS } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';

	let {
		labels,
		datasets,
		smooth = false,
		options = {},
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		labels: string[];
		datasets: LineDataset[];
		smooth?: boolean;
		options?: ChartOptions<'line'>;
		chart?: ChartJS | undefined;
	} = $props();

	let darkSignal = $state(0);

	$effect(() => {
		const obs = new MutationObserver(() => darkSignal++);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => obs.disconnect();
	});

	const config = $derived.by((): ChartConfiguration<'line'> => {
		darkSignal;
		const theme = getChartTheme();
		const tension = smooth ? 0.4 : 0;
		const { plugins: userPlugins, scales: userScales, ...restOptions } = options as any;

		return {
			type: 'line',
			data: {
				labels,
				datasets: datasets.map((ds, i) => {
					const color = seriesColor(i, ds.color);
					return {
						label: ds.label,
						data: ds.data,
						borderColor: color,
						backgroundColor: ds.fill ? color + '33' : color,
						fill: ds.fill ?? false,
						tension,
						pointRadius: 4,
						pointHoverRadius: 6,
					};
				}),
			},
			options: {
				responsive: true,
				interaction: { mode: 'index', intersect: false },
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
