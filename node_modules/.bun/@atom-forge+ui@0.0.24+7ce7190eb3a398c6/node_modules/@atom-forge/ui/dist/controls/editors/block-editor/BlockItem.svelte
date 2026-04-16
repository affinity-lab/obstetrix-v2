<script lang="ts">
	import type { Component } from 'svelte';
	import {
		GripVertical, Plus, X, Copy, Check,
		ChevronDown, ChevronRight, ArrowUp, ArrowDown,
		AlignLeft, Heading, Quote, Minus, Youtube, Table2, FileText, LayoutGrid, Code2,
		CheckSquare, Bookmark,
	} from 'lucide-svelte';
	import { ContextMenu, type ContextMenuItemConfig } from '../../overlays/context-menu';
	import { getPopupManager } from '../../overlays/popup';
	import type { IconComponent } from '../../general/icon';
	import { getBlockAPI } from './context.js';
	import type { Block } from './types.js';

	let {
		block,
		components,
		typeLabels    = {},
		collapsed     = false,
		onToggleCollapse,
		isFirst       = false,
		isLast        = false,
		onMoveUp,
		onMoveDown,
	}: {
		block:      Block;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		components: Record<string, Component<any>>;
		typeLabels?: Record<string, string>;
		collapsed?:       boolean;
		onToggleCollapse?: () => void;
		isFirst?:  boolean;
		isLast?:   boolean;
		onMoveUp?:   () => void;
		onMoveDown?: () => void;
	} = $props();

	const api          = getBlockAPI();
	const popupManager = getPopupManager();

	// Resolved at script level so Svelte recognises it as a component tag
	const BlockComp = $derived(components[block.type] as Component<{ id: string; data: any }> | undefined);

	const typeIconMap: Record<string, IconComponent> = {
		text:     AlignLeft,
		heading:  Heading,
		quote:    Quote,
		divider:  Minus,
		youtube:  Youtube,
		table:    Table2,
		markdown: FileText,
		code:     Code2,
		todo:     CheckSquare,
		link:     Bookmark,
	};

	function getTypeLabel(type: string): string {
		return typeLabels[type] ?? (type.charAt(0).toUpperCase() + type.slice(1));
	}

	function getBlockPreview(block: Block): string {
		if (!block.data) return '';

		switch (block.type) {
			case 'heading':
			case 'markdown':
			case 'text':
			case 'quote':
				return block.data.text || '';
			case 'youtube':
				return block.data.title || block.data.url || '';
			case 'callout':
				return block.data.title || block.data.text || '';
			case 'code':
				return block.data.title || (block.data.files?.[0]?.filename ?? '');
			case 'todo':
				const total = block.data.items?.length ?? 0;
				const checked = block.data.items?.filter((i: any) => i.checked).length ?? 0;
				return block.data.title || `${checked}/${total} tasks`;
			case 'link':
				return block.data.title || block.data.url || '';
			case 'diagram':
				return block.data.caption || '';
			case 'table':
				const rows = block.data.rows?.length ?? 0;
				const cols = block.data.rows?.[0]?.length ?? 0;
				return `${rows}×${cols}`;
			case 'divider':
				return '';
			default:
				return '';
		}
	}

	function truncate(str: string, maxLen: number = 50): string {
		if (!str) return '';
		str = str.trim().replace(/\s+/g, ' ');
		return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
	}

	let copied = $state(false);

	function copyId() {
		navigator.clipboard.writeText(block.id);
		copied = true;
		setTimeout(() => { copied = false; }, 1500);
	}

	async function openInsertMenu(event: MouseEvent) {
		const config: ContextMenuItemConfig[] = Object.keys(components).map(type => ({
			icon: typeIconMap[type] ?? LayoutGrid,
			label: getTypeLabel(type),
			onclick: (_e: MouseEvent, manager: any) => {
				api.insertAfter(block.id, { type, data: null });
				manager.resolveRoot(undefined);
			},
		}));
		await popupManager.open.component(ContextMenu, { config }, { pos: event });
	}

	const btnBase = 'flex items-center justify-center w-5 h-5 rounded transition-colors cursor-pointer';
	const btnMuted = `${btnBase} text-muted-contrast hover:text-canvas-contrast hover:bg-secondary`;
</script>

<div class="group/item rounded-lg border border-frame bg-surface overflow-hidden">
	<!-- Toolbar -->
	<div class="flex items-center gap-1.5 px-2 py-1">

		<!-- Left: drag, insert, ↑, ↓ — collapse to zero when not hovered -->
		<div class="flex items-center gap-0.5 max-w-0 overflow-hidden group-hover/item:max-w-24 transition-[max-width] duration-150 ease-out shrink-0">
			<div
				data-drag-handle
				class="flex items-center justify-center w-5 h-5 text-muted-contrast hover:text-canvas-contrast transition-colors cursor-grab active:cursor-grabbing shrink-0"
			>
				<GripVertical size={14} />
			</div>

			<button class={btnMuted} onclick={openInsertMenu} title="Insert block after" tabindex="-1">
				<Plus size={12} />
			</button>

			<button
				class="{btnBase} {isFirst ? 'text-muted-contrast/30 cursor-default' : 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary'}"
				onclick={isFirst ? undefined : onMoveUp}
				title="Move up"
				tabindex="-1"
			>
				<ArrowUp size={12} />
			</button>

			<button
				class="{btnBase} {isLast ? 'text-muted-contrast/30 cursor-default' : 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary'}"
				onclick={isLast ? undefined : onMoveDown}
				title="Move down"
				tabindex="-1"
			>
				<ArrowDown size={12} />
			</button>
		</div>

		<!-- Collapse toggle + type label (always visible) -->
		<button
			class="flex items-center gap-1 hover:text-canvas-contrast transition-colors cursor-pointer min-w-0"
			onclick={onToggleCollapse}
			title={collapsed ? 'Expand' : 'Collapse'}
		>
			{#if collapsed}
				<ChevronRight size={12} class="shrink-0 text-muted-contrast" />
			{:else}
				<ChevronDown size={12} class="shrink-0 text-muted-contrast" />
			{/if}
			<span class="text-xs select-none truncate flex items-baseline gap-1 min-w-0">
				<span class="text-muted-contrast shrink-0">{getTypeLabel(block.type)}</span>
				{#if collapsed && getBlockPreview(block)}
					<span class="text-muted-contrast/50 shrink-0">:</span>
					<span class="text-canvas-contrast truncate">{truncate(getBlockPreview(block))}</span>
				{/if}
			</span>
		</button>

		<div class="flex-1"></div>

		<!-- Right: copy ID + delete — fade in on hover -->
		<div class="flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
			<button
				class="{btnMuted}"
				onclick={copyId}
				title="Copy block ID"
				tabindex="-1"
			>
				{#if copied}
					<Check size={11} class="text-accent" />
				{:else}
					<Copy size={11} />
				{/if}
			</button>
			<button
				class="{btnBase} text-muted-contrast hover:text-error hover:bg-error/10"
				onclick={() => api.deleteBlock(block.id)}
				title="Delete block"
				tabindex="-1"
			>
				<X size={13} />
			</button>
		</div>
	</div>

	<!-- Block content — hidden when collapsed -->
	{#if !collapsed}
		<div class="px-2">
			{#if BlockComp}
				<BlockComp id={block.id} data={block.data} />
			{:else}
				<div class="py-2 text-error text-xs">
					Unknown block type: <code>{block.type}</code>
				</div>
			{/if}
		</div>
	{/if}
</div>
