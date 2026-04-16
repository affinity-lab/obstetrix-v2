<script lang="ts">
	import Chart from './Chart.svelte';
	import { getChartTheme, seriesColor } from './theme.js';
	import type { RadarDataset } from './types.js';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import type { Chart as ChartJS } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';

	let {
		labels,
		datasets,
		options = {},
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		labels: string[];
		datasets: RadarDataset[];
		options?: ChartOptions<'radar'>;
		chart?: ChartJS | undefined;
	} = $props();

	let darkSignal = $state(0);

	$effect(() => {
		const obs = new MutationObserver(() => darkSignal++);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => obs.disconnect();
	});

	const config = $derived.by((): ChartConfiguration<'radar'> => {
		darkSignal;
		const theme = getChartTheme();
		const { plugins: userPlugins, scales: userScales, ...restOptions } = options as any;

		return {
			type: 'radar',
			data: {
				labels,
				datasets: datasets.map((ds, i) => {
					const color = seriesColor(i, ds.color);
					return {
						label: ds.label,
						data: ds.data,
						borderColor: color,
						backgroundColor: ds.fill !== false ? color + '33' : 'transparent',
						pointBackgroundColor: color,
						pointRadius: 4,
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
					r: {
						ticks: { color: theme.text, backdropColor: 'transparent' },
						grid: { color: theme.grid },
						pointLabels: { color: theme.text },
						...(userScales?.r ?? {}),
					},
				},
			},
		};
	});
</script>

<Chart {config} class={classes} bind:chart />
