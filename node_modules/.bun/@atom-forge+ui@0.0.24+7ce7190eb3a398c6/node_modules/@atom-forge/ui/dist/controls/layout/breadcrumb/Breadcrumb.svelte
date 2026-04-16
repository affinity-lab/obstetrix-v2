<script lang="ts">
	import type {ClassProp} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";
	import {getPopupManager} from "../../overlays/popup/popup-manager.svelte";
	import {ContextMenu, type ContextMenuItemConfig} from "../../overlays/context-menu";

	type BreadcrumbItem = { label: string; href?: string; onclick?: (e: MouseEvent) => void };

	let {
		items,
		maxLabelLength,
		maxSegments,
		class: classes,
	}: ClassProp & {
		items: BreadcrumbItem[]
		maxLabelLength?: number
		maxSegments?: number
	} = $props();

	const popupManager = getPopupManager();

	function truncate(label: string): string {
		if (!maxLabelLength || label.length <= maxLabelLength) return label;
		return label.slice(0, maxLabelLength) + '…';
	}

	type VisibleItem = (BreadcrumbItem & { collapsed?: never }) | { collapsed: true; hidden: BreadcrumbItem[] };

	const visibleItems = $derived((): VisibleItem[] => {
		if (!maxSegments || items.length <= maxSegments) return items;
		const first  = items[0];
		const last   = items[items.length - 1];
		const hidden = items.slice(1, items.length - 1);
		return [first, { collapsed: true, hidden }, last];
	});

	async function openCollapsed(event: MouseEvent, hidden: BreadcrumbItem[]) {
		const config: ContextMenuItemConfig[] = hidden.map(item => {
			if (item.onclick) {
				return {
					label: item.label,
					onclick: (e: MouseEvent) => item.onclick!(e),
				} satisfies ContextMenuItemConfig;
			}
			if (item.href) {
				return {
					label: item.label,
					onclick: () => { window.location.href = item.href!; },
				} satisfies ContextMenuItemConfig;
			}
			return { label: item.label, disabled: true, resolveWith: null } satisfies ContextMenuItemConfig;
		});
		await popupManager.open.component(ContextMenu, { config }, { anchor: event.currentTarget as HTMLElement, align: 'left' });
	}
</script>

<nav aria-label="Breadcrumb" class={twMerge('flex items-center gap-1 text-sm', classes)}>
	{#each visibleItems() as item, i}
		{@const isLast = i === visibleItems().length - 1}
		{#if i > 0}
			<span class="text-muted-contrast select-none">/</span>
		{/if}
		{#if item.collapsed}
			<button
				type="button"
				onclick={(e) => openCollapsed(e, item.hidden)}
				class="px-1.5 py-0.5 text-xs text-muted-contrast hover:text-canvas-contrast hover:bg-secondary rounded transition-colors cursor-pointer leading-none"
				aria-label="Show hidden breadcrumb items"
			>…</button>
		{:else if (item.href || item.onclick) && !isLast}
			<a
				href={item.href ?? '#'}
				onclick={item.onclick}
				class="text-muted-contrast hover:text-canvas-contrast transition-colors truncate max-w-32"
				title={item.label}
			>{truncate(item.label)}</a>
		{:else}
			<span class="text-canvas-contrast font-medium truncate max-w-48" title={item.label}>{truncate(item.label)}</span>
		{/if}
	{/each}
</nav>
