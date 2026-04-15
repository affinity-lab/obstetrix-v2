<script lang="ts">
	import Chart from './Chart.svelte';
	import { getChartTheme, seriesColor } from './theme.js';
	import type { BarDataset } from './types.js';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import type { Chart as ChartJS } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';

	let {
		labels,
		datasets,
		stacked = false,
		horizontal = false,
		options = {},
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		labels: string[];
		datasets: BarDataset[];
		stacked?: boolean;
		horizontal?: boolean;
		options?: ChartOptions<'bar'>;
		chart?: ChartJS | undefined;
	} = $props();

	let darkSignal = $state(0);

	$effect(() => {
		const obs = new MutationObserver(() => darkSignal++);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => obs.disconnect();
	});

	const config = $derived.by((): ChartConfiguration<'bar'> => {
		darkSignal;
		const theme = getChartTheme();
		const { plugins: userPlugins, scales: userScales, ...restOptions } = options as any;

		return {
			type: 'bar',
			data: {
				labels,
				datasets: datasets.map((ds, i) => ({
					label: ds.label,
					data: ds.data,
					backgroundColor: seriesColor(i, ds.color) + 'cc',
					borderColor: seriesColor(i, ds.color),
					borderWidth: 1,
				})),
			},
			options: {
				responsive: true,
				indexAxis: horizontal ? 'y' : 'x',
				interaction: { mode: 'index', intersect: false },
				...restOptions,
				plugins: {
					legend: { labels: { color: theme.text } },
					...userPlugins,
				},
				scales: {
					x: {
						stacked,
						ticks: { color: theme.text },
						grid: { color: theme.grid },
						...(userScales?.x ?? {}),
					},
					y: {
						stacked,
						ticks: { color: theme.text },
						grid: { color: theme.grid },
						...(userScales?.y ?? {}),
					},
				},
			},
		};
	});
</script>

<Chart {config} class={classes} bind:chart />
