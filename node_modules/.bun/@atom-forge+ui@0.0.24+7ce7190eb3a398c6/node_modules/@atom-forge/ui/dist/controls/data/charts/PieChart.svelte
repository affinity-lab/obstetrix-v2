<script lang="ts">
	import Chart from './Chart.svelte';
	import { getChartTheme, seriesColor } from './theme.js';
	import type { ChartConfiguration, ChartOptions } from 'chart.js';
	import type { Chart as ChartJS } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';

	let {
		labels,
		data,
		colors,
		options = {},
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		labels: string[];
		data: number[];
		colors?: string[];
		options?: ChartOptions<'pie'>;
		chart?: ChartJS | undefined;
	} = $props();

	let darkSignal = $state(0);

	$effect(() => {
		const obs = new MutationObserver(() => darkSignal++);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
		return () => obs.disconnect();
	});

	const config = $derived.by((): ChartConfiguration<'pie'> => {
		darkSignal;
		const theme = getChartTheme();
		const { plugins: userPlugins, ...restOptions } = options as any;

		return {
			type: 'pie',
			data: {
				labels,
				datasets: [{
					data,
					backgroundColor: data.map((_, i) => seriesColor(i, colors?.[i]) + 'cc'),
					borderColor: data.map((_, i) => seriesColor(i, colors?.[i])),
					borderWidth: 1,
				}],
			},
			options: {
				responsive: true,
				...restOptions,
				plugins: {
					legend: { labels: { color: theme.text } },
					...userPlugins,
				},
			},
		};
	});
</script>

<Chart {config} class={classes} bind:chart />
