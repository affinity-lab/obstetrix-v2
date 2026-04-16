<script module lang="ts">
	export type PropDef = {
		name?: string;
		type?: string;
		description?: string;
		default?: string;
		group?: string;
	};
</script>

<script lang="ts">
	let { props }: { props: PropDef[] } = $props();

	type Section = { label: string | null; items: PropDef[] };

	const sections = $derived.by<Section[]>(() => {
		const result: Section[] = [];
		let current: Section | null = null;
		for (const prop of props) {
			const g = prop.group ?? null;
			if (!current || current.label !== g) {
				current = { label: g, items: [] };
				result.push(current);
			}
			if (prop.name) current.items.push(prop);
		}
		return result;
	});

	function parseDesc(text: string): { text: string; code: boolean }[] {
		const parts: { text: string; code: boolean }[] = [];
		const regex = /<code>(.*?)<\/code>/g;
		let lastIndex = 0, match;
		while ((match = regex.exec(text)) !== null) {
			if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), code: false });
			parts.push({ text: match[1], code: true });
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), code: false });
		return parts;
	}
</script>

<div class="overflow-x-auto">
	<table class="table-auto w-full text-sm border-collapse">
		<thead>
			<tr class="border-b border-frame">
				<th class="px-3 py-2.5 text-left text-xs font-semibold text-muted-contrast uppercase tracking-wider w-36">Prop</th>
				<th class="px-3 py-2.5 text-left text-xs font-semibold text-muted-contrast uppercase tracking-wider w-44">Type</th>
				<th class="px-3 py-2.5 text-left text-xs font-semibold text-muted-contrast uppercase tracking-wider w-24">Default</th>
				<th class="px-3 py-2.5 text-left text-xs font-semibold text-muted-contrast uppercase tracking-wider">Description</th>
			</tr>
		</thead>
		<tbody>
			{#each sections as section}
				{#if section.label}
					<tr>
						<td colspan="4" class="px-3 pt-5 pb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-contrast border-t border-frame/50">
							{section.label}
						</td>
					</tr>
				{/if}
				{#each section.items as prop}
					<tr class="border-t border-frame/40 hover:bg-secondary/30 transition-colors">
						<td class="px-3 py-2.5 font-mono text-xs font-semibold text-canvas-contrast align-top">{prop.name}</td>
						<td class="px-3 py-2.5 font-mono text-xs text-accent align-top">{prop.type}</td>
						<td class="px-3 py-2.5 text-xs text-muted-contrast align-top">{prop.default ?? '—'}</td>
						<td class="px-3 py-2.5 text-canvas-contrast align-top leading-relaxed text-sm">
							{#each parseDesc(prop.description ?? '') as part}
								{#if part.code}
									<code class="bg-secondary text-canvas-contrast text-xs font-mono font-bold px-1.5 py-0.5 rounded">{part.text}</code>
								{:else}
									{part.text}
								{/if}
							{/each}
						</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</div>
