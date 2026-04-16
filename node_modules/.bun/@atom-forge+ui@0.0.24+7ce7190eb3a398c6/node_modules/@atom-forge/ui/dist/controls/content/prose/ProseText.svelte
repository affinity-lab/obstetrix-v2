<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let { children, class: classes, ...props }: {
		children: Snippet;
		class?: string;
		[key: string]: any;
	} = $props();
</script>

<p class={twMerge("text-base-600 dark:text-base-400", classes)} {...props}>
	{@render children()}
</p>
