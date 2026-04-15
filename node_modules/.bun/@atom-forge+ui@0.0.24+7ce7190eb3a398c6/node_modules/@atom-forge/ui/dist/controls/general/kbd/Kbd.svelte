<script lang="ts">
	import type {ClassProp} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";

	let {
		keys,
		class: classes,
	}: ClassProp & {
		keys: string | string[]
	} = $props();

	const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

	function resolveKey(key: string): string {
		switch (key.toLowerCase()) {
			case 'meta': return isMac ? '⌘' : 'Ctrl';
			case 'cmd':  return '⌘';
			case 'ctrl': return 'Ctrl';
			default:     return key;
		}
	}

	const keyList = $derived((Array.isArray(keys) ? keys : [keys]).map(resolveKey));
</script>

<span class={twMerge('inline-flex items-center gap-0.5', classes)}>
	{#each keyList as key, i}
		{#if i > 0}
			<span class="text-muted-contrast text-xs">+</span>
		{/if}
		<kbd class="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-frame bg-gradient-to-b from-secondary to-white dark:from-secondary dark:to-white/10 text-canvas-contrast font-mono text-[11px] font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(0,0,0,0.4)] leading-none">
			{key}
		</kbd>
	{/each}
</span>
