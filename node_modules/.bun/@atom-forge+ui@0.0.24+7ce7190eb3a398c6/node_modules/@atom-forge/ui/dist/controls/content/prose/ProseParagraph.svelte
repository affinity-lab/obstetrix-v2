<script lang="ts">
	import type { Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let { children, class: classes }: { children: Snippet; class?: string } = $props();
</script>

<div class={twMerge('flex flex-col gap-4', classes)}>
	{@render children()}
</div>
