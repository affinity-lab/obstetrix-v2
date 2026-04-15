<script lang="ts">
	let {
		videoId: id,
		url,
		title
	}: {
		videoId?: string;
		url?: string;
		title?: string;
	} = $props();

	function getVideoId(raw?: string): string | null {
		if (!raw) return null;
		try {
			const u = new URL(raw);
			return u.searchParams.get('v') ?? (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);
		} catch { return raw; } // Assume it's an ID if not a valid URL
	}

	let playing = $state(false);

	const videoId = $derived(id ?? getVideoId(url));
	const thumbUrl = $derived(videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
	const embedUrl = $derived(videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null);
</script>

{#if thumbUrl}
	<div class="rounded-lg overflow-hidden bg-black">
		{#if playing && embedUrl}
			<div class="aspect-video w-full">
				<iframe
					src={embedUrl}
					title={title || 'YouTube video'}
					class="w-full h-full"
					allowfullscreen
					allow="autoplay"
				></iframe>
			</div>
		{:else}
			<button
				class="relative block w-full aspect-video cursor-pointer group/thumb"
				onclick={() => playing = true}
			>
				<img src={thumbUrl} alt={title || 'YouTube thumbnail'} class="w-full h-full object-cover" />
				<span class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/40 transition-colors">
					<span class="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center group-hover/thumb:bg-red-600 transition-colors">
						<svg class="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					</span>
				</span>
			</button>
		{/if}
		{#if title}
			<div class="px-3 py-2 text-sm font-medium text-canvas-contrast bg-canvas">{title}</div>
		{/if}
	</div>
{/if}
