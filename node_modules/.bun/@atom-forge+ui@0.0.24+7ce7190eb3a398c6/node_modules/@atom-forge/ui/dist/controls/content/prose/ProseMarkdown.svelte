<script lang="ts">
	import { marked } from 'marked';
	import type { Snippet } from 'svelte';

	let { content, children }: { content?: string; children?: Snippet } = $props();

	const html = $derived(content?.trim() ? marked.parse(content) as string : '');
</script>

{#if children}
	<div class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-canvas-contrast prose-p:text-muted-contrast prose-strong:text-canvas-contrast prose-strong:font-semibold prose-em:text-canvas-contrast prose-code:text-accent prose-blockquote:text-muted-contrast prose-li:text-muted-contrast">
		{@render children()}
	</div>
{:else if html}
	<div class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-canvas-contrast prose-p:text-muted-contrast prose-strong:text-canvas-contrast prose-strong:font-semibold prose-em:text-canvas-contrast prose-code:text-accent prose-blockquote:text-muted-contrast prose-li:text-muted-contrast">
		{@html html}
	</div>
{/if}
