<script lang="ts">
	import { ExternalLink, Link } from 'lucide-svelte';
	import {as} from '../../../helpers/as';

	let { url, title, description, favicon }: {
		url: string;
		title?: string;
		description?: string;
		favicon?: string;
	} = $props();

	const domain = $derived.by(() => {
		try {
			return url ? new URL(url).hostname.replace('www.', '') : '';
		} catch {
			return '';
		}
	});
</script>

{#if url}
	<a
		href={url}
		target="_blank"
		rel="noopener noreferrer"
		class="block rounded-lg border border-frame overflow-hidden hover:border-accent transition-colors group"
	>
		<div class="flex gap-3 p-4 bg-surface">
			{#if favicon}
				<img src={favicon} alt="" class="w-12 h-12 rounded object-cover shrink-0" onerror={(e) => (as<HTMLImageElement>(e.currentTarget)).style.display = 'none'} />
			{:else}
				<div class="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
					<Link size={20} class="text-muted-contrast" />
				</div>
			{/if}
			<div class="flex-1 min-w-0">
				<div class="flex items-start justify-between gap-2">
					<h4 class="text-sm font-semibold text-canvas-contrast group-hover:text-accent transition-colors">
						{title || domain || 'Untitled Link'}
					</h4>
					<ExternalLink size={12} class="text-muted-contrast shrink-0 mt-0.5" />
				</div>
				{#if description}
					<p class="text-xs text-muted-contrast mt-1 line-clamp-2 leading-relaxed">{description}</p>
				{/if}
				{#if domain}
					<p class="text-xs text-muted-contrast/70 mt-1">{domain}</p>
				{/if}
			</div>
		</div>
	</a>
{:else}
	<div class="rounded-lg border border-dashed border-frame p-6 text-center">
		<p class="text-xs text-muted-contrast italic">No URL provided</p>
	</div>
{/if}
