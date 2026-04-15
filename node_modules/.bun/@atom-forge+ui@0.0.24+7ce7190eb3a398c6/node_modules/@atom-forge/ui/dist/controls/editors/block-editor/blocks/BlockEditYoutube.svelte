<script lang="ts">
	import {type Snippet, untrack} from 'svelte';
	import {getBlockAPI} from '../context.js';
	import type {BlockController} from '../types.js';
	import {as} from '../../../../helpers/as';
	import {Input} from '../../../forms/input';

	let {id, data}: { id: string; data: { url: string; title?: string } | null } = $props();

	const api = getBlockAPI();

	let urlInput = $state(untrack(() => data?.url ?? ''));
	let titleInput = $state(untrack(() => data?.title ?? ''));
	let focused = $state(false);
	let playing = $state(false);
	let firstInput = $state<{ focus: () => void } | undefined>(undefined);

	$effect(() => {
		const controller: BlockController = {
			focus(_direction) {
				firstInput?.focus();
			},
		};
		api.register(id, controller);
		return () => api.unregister(id);
	});

	function getVideoId(raw: string): string | null {
		try {
			const u = new URL(raw);
			return u.searchParams.get('v') ?? (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null);
		} catch {
			return null;
		}
	}

	const videoId = $derived(urlInput.trim() ? getVideoId(urlInput.trim()) : null);
	const thumbUrl = $derived(videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
	const embedUrl = $derived(videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null);

	function commit() {
		const url = urlInput.trim();
		if (url) {
			api.updateData(id, {url, title: titleInput.trim() || undefined});
		}
	}

	function handleBlur() {
		setTimeout(() => {
			if (!focused) commit();
		}, 100);
	}

	function handleUrlKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit();
		} else if (e.key === 'Escape') {
			api.deleteBlock(id);
		} else if (e.key === 'Backspace' && urlInput === '') {
			e.preventDefault();
			api.deleteBlock(id);
		}
	}

</script>

{#snippet youtubeIcon()}
	<svg class="w-4 h-4 text-muted-contrast" viewBox="0 0 24 24" fill="currentColor">
		<path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
	</svg>
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="py-2 flex flex-col gap-2"
	onfocusin={() => { focused = true; playing = false; }}
	onfocusout={() => { focused = false; handleBlur(); }}
>
	<Input
		bind:this={firstInput}
		bind:value={urlInput}
		compact
		placeholder="YouTube URL..."
		prefix={as<Snippet>(youtubeIcon)}
		onkeydown={handleUrlKeydown}
	/>
	<Input
		bind:value={titleInput}
		compact
		placeholder="Title (optional)"
		onkeydown={(e) => { if (as<KeyboardEvent>(e).key === 'Enter') { e.preventDefault(); commit(); } }}
	/>

	<!-- Preview — shown on blur when URL is valid -->
	{#if thumbUrl && !focused}
		<div class="rounded-lg overflow-hidden bg-black">
			{#if playing && embedUrl}
				<div class="aspect-video w-full">
					<iframe
						src={embedUrl}
						title={titleInput || 'YouTube video'}
						class="w-full h-full"
						allowfullscreen
						frameborder="0"
						allow="autoplay"
					></iframe>
				</div>
			{:else}
				<button class="relative block w-full aspect-video cursor-pointer group/thumb" onclick={() => playing = true}>
					<img src={thumbUrl} alt={titleInput || 'YouTube thumbnail'} class="w-full h-full object-cover"/>
					<div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/40 transition-colors">
						<div class="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center group-hover/thumb:bg-red-600 transition-colors">
							<svg class="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
								<path d="M8 5v14l11-7z"/>
							</svg>
						</div>
					</div>
				</button>
			{/if}
			{#if titleInput}
				<div class="px-3 py-2 text-sm font-medium text-canvas-contrast bg-canvas">{titleInput}</div>
			{/if}
		</div>
	{/if}
</div>
