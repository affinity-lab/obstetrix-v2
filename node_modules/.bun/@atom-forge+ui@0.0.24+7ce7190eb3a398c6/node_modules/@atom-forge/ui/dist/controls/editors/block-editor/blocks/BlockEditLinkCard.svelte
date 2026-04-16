 <script module lang="ts">
	export type LinkCardData = {
		url: string;
		title: string;
		description: string;
		favicon: string;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { Link, RefreshCw } from 'lucide-svelte';
	import { getBlockAPI } from '../context.js';

	let { id, data }: { id: string; data: LinkCardData | null } = $props();

	const api = getBlockAPI();

	let url         = $state(untrack(() => data?.url         ?? ''));
	let title       = $state(untrack(() => data?.title       ?? ''));
	let description = $state(untrack(() => data?.description ?? ''));
	let favicon     = $state(untrack(() => data?.favicon     ?? ''));
	let fetching    = $state(false);

	$effect(() => {
		const d = data;
		untrack(() => {
			if (!d) return;
			if (d.url         !== url)         url         = d.url;
			if (d.title       !== title)       title       = d.title;
			if (d.description !== description) description = d.description;
			if (d.favicon     !== favicon)     favicon     = d.favicon;
		});
	});

	$effect(() => {
		api.register(id, { focus() {} });
		return () => api.unregister(id);
	});

	function save() {
		api.updateData(id, { url, title, description, favicon });
	}

	async function fetchMetadata() {
		if (!url.trim()) return;
		fetching = true;
		try {
			// Simple heuristic extraction from URL
			const urlObj = new URL(url);
			const domain = urlObj.hostname.replace('www.', '');

			// Set favicon from domain
			favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

			// If title is empty, use domain as fallback
			if (!title) {
				title = domain.charAt(0).toUpperCase() + domain.slice(1);
			}

			save();
		} catch (e) {
			console.error('Invalid URL:', e);
		} finally {
			fetching = false;
		}
	}

	function autogrow(node: HTMLTextAreaElement) {
		function resize() { node.style.height = 'auto'; node.style.height = node.scrollHeight + 'px'; }
		resize();
		node.addEventListener('input', resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	const inputCls = 'bg-transparent border-none outline-none text-sm text-canvas-contrast placeholder:text-muted-contrast/50 min-w-0 w-full';
</script>

<div class="space-y-2 py-1">
	<!-- URL -->
	<div class="flex items-center gap-2 px-1">
		<Link size={14} class="text-muted-contrast shrink-0" />
		<input
			bind:value={url}
			oninput={save}
			onblur={fetchMetadata}
			placeholder="https://example.com"
			type="url"
			class="{inputCls} font-mono text-xs"
		/>
		<button
			class="flex items-center justify-center w-5 h-5 rounded text-muted-contrast hover:text-canvas-contrast hover:bg-secondary transition-colors cursor-pointer shrink-0"
			onclick={fetchMetadata}
			disabled={fetching}
			title="Fetch metadata"
		>
			<RefreshCw size={11} class={fetching ? 'animate-spin' : ''} />
		</button>
	</div>

	<!-- Preview card -->
	<div class="rounded-lg border border-frame overflow-hidden bg-muted/20">
		<div class="flex gap-3 p-3">
			{#if favicon}
				<img src={favicon} alt="" class="w-12 h-12 rounded object-cover shrink-0" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
			{:else}
				<div class="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
					<Link size={20} class="text-muted-contrast" />
				</div>
			{/if}

			<div class="flex-1 min-w-0 space-y-1">
				<input
					bind:value={title}
					oninput={save}
					placeholder="Link title"
					class="{inputCls} font-semibold"
				/>
				<textarea
					bind:value={description}
					use:autogrow
					oninput={save}
					placeholder="Link description (optional)"
					rows={1}
					class="{inputCls} text-xs text-muted-contrast resize-none overflow-hidden"
				></textarea>
				{#if url}
					<p class="text-xs text-muted-contrast/70 truncate">{new URL(url).hostname.replace('www.', '')}</p>
				{/if}
			</div>
		</div>
	</div>
</div>


