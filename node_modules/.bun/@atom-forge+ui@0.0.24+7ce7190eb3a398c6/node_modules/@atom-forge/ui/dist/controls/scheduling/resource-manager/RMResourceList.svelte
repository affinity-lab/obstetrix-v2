<script lang="ts">
	import { getRMContext, HEADER_H, LIST_W } from './rm.svelte';

	let { scrollTop = $bindable(0) }: { scrollTop?: number } = $props();

	let ctx = getRMContext();
	let el = $state<HTMLDivElement | undefined>();

	$effect(() => {
		if (el && el.scrollTop !== scrollTop) el.scrollTop = scrollTop;
	});

	function initials(name: string): string {
		return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
	}

	// Deterministic color from name
	function avatarColor(name: string): string {
		const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];
		let h = 0;
		for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length;
		return colors[Math.abs(h)];
	}
</script>

<div class="shrink-0 flex flex-col border-r border-frame bg-canvas" style="width: {LIST_W}px">
	<div
		class="shrink-0 flex items-end px-3 pb-2 border-b border-frame bg-canvas text-xs text-muted-contrast uppercase tracking-wider font-medium"
		style="height: {HEADER_H}px"
	>
		Resource
	</div>

	<div
		bind:this={el}
		class="overflow-y-auto overflow-x-hidden flex-1"
		onscroll={() => { if (el) scrollTop = el.scrollTop; }}
	>
		{#each ctx.rows as row (row.resource.id)}
			<div
				class="flex items-center gap-2.5 px-3 border-b border-frame"
				style="height: {row.rowHeight}px"
			>
				{#if row.resource.avatar}
					<img
						src={row.resource.avatar}
						alt={row.resource.name}
						class="w-8 h-8 rounded-full shrink-0 object-cover"
					/>
				{:else}
					<div
						class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold text-white"
						style="background-color: {avatarColor(row.resource.name)}"
					>
						{initials(row.resource.name)}
					</div>
				{/if}
				<div class="min-w-0">
					<div class="text-xs font-medium text-canvas-contrast truncate">{row.resource.name}</div>
					{#if row.resource.role}
						<div class="text-[10px] text-muted-contrast truncate">{row.resource.role}</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
