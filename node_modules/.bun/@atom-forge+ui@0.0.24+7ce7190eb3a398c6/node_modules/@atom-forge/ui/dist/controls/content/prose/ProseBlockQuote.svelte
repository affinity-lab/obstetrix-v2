<script lang="ts">
	let { quote, author }: { quote: string; author?: string } = $props();
</script>

{#if quote?.trim()}
	<div class="flex gap-3">
		<div class="w-1 rounded-full bg-accent shrink-0 self-stretch min-h-4"></div>
		<div>
			<p class="text-sm italic leading-relaxed text-canvas-contrast whitespace-pre-wrap">{quote}</p>
			{#if author}
				<p class="text-xs text-muted-contrast mt-1">— {author}</p>
			{/if}
		</div>
	</div>
{/if}
