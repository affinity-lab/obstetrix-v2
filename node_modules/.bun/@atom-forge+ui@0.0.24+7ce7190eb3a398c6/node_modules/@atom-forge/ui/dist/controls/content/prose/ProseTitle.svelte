<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		children,
		subtitle,
		level = 1,
		class: classes,
	}: {
		children: Snippet;
		subtitle?: string;
		level?: 1 | 2 | 3;
		class?: string;
	} = $props();
</script>

<div class={twMerge(classes)}>
	{#if level === 1}
		<h1 class="text-3xl font-bold text-canvas-contrast">{@render children()}</h1>
	{:else if level === 2}
		<h2 class="text-xl font-semibold text-canvas-contrast">{@render children()}</h2>
	{:else}
		<h3 class="text-base font-semibold text-canvas-contrast">{@render children()}</h3>
	{/if}
	{#if subtitle}
		<p class="text-sm text-muted-contrast mt-1">{subtitle}</p>
	{/if}
</div>
