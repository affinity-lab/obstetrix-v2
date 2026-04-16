<script lang="ts">
	import type { Snippet } from "svelte";
	import { twMerge } from "tailwind-merge";

	let { children, class: classes, ...props }: { children: Snippet, class?: string, [key: string]: any } = $props();
</script>

<code class={twMerge("bg-secondary text-canvas-contrast dark:bg-stone-800 dark:text-canvas-contrast mx-1 text-xs font-bold px-1 py-0.5 rounded", classes)} {...props}>{@render children()}</code>
