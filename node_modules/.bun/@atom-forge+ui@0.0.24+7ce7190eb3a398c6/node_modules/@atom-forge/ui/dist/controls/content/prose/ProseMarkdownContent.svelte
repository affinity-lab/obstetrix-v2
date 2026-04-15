<script lang="ts">
	import { marked } from 'marked';

	let { content }: { content: string } = $props();

	const html = $derived(content?.trim() ? marked.parse(content) as string : '');
</script>

{#if html}
	<div class="prose prose-sm dark:prose-invert max-w-none prose-headings:text-canvas-contrast prose-p:text-muted-contrast prose-strong:text-canvas-contrast prose-strong:font-semibold prose-em:text-canvas-contrast prose-code:text-accent prose-blockquote:text-muted-contrast prose-li:text-muted-contrast">
		{@html html}
	</div>
{/if}
