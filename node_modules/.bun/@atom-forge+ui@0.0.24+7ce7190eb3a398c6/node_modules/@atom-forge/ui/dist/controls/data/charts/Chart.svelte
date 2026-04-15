<script lang="ts">
	import { untrack } from 'svelte';
	// Revert to named import, as the initial error message implied 'Chart' is a named export.
	import { Chart } from 'chart.js/auto';
	import type { ChartConfiguration } from 'chart.js';
	import type { ClassProp } from '../../../helpers/types';
	import { twMerge } from 'tailwind-merge';

	// Explicitly assign the imported Chart to a local constant.
	// This assignment itself should be recognized as a "use" by the linter,
	// even if it struggles with Svelte's reactive blocks.
	const ChartConstructor = Chart;

	let {
		config,
		class: classes,
		chart = $bindable(undefined),
	}: ClassProp & {
		config: ChartConfiguration;
		chart?: Chart | undefined; // Use Chart for type annotation
	} = $props();

	let canvas = $state<HTMLCanvasElement | undefined>(undefined);
	let instance: Chart | undefined; // Use Chart for type annotation

	// Create chart when canvas is available
	$effect(() => {
		const el = canvas;
		if (!el) return;

		// Use the local ChartConstructor constant
		instance = untrack(() => new ChartConstructor(el, config));
		chart = instance;

		return () => {
			instance?.destroy();
			instance = undefined;
			chart = undefined;
		};
	});

	// Update chart when config changes
	$effect(() => {
		const cfg = config;
		untrack(() => {
			if (!instance) return;
			instance.data = cfg.data;
			if (cfg.options) instance.options = cfg.options as any;
			instance.update();
		});
	});
</script>

<canvas bind:this={canvas} class={twMerge('w-full', classes)}></canvas>
