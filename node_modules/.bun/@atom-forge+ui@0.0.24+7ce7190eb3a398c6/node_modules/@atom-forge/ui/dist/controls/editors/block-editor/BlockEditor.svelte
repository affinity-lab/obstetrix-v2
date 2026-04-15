<script module lang="ts">
	import type {Component} from 'svelte';
	import BlockViewHeading from './blocks/BlockViewHeading.svelte';
	import BlockViewTextarea from './blocks/BlockViewTextarea.svelte';
	import BlockViewMarkdown from './blocks/BlockViewMarkdown.svelte';
	import BlockViewQuote from './blocks/BlockViewQuote.svelte';
	import BlockViewDivider from './blocks/BlockViewDivider.svelte';
	import BlockViewYoutube from './blocks/BlockViewYoutube.svelte';
	import TablePreview from '../table-editor/TablePreview.svelte';
	import BlockViewDiagram from './blocks/BlockViewDiagram.svelte';
	import BlockViewCallout from './blocks/BlockViewCallout.svelte';
	import BlockViewCode from './blocks/BlockViewCode.svelte';
	import BlockViewLinkCard from './blocks/BlockViewLinkCard.svelte';

	// Built-in preview components — consumers can spread and extend for custom block types
	export const defaultPreviewComponents: Record<string, Component<any>> = {
		heading: BlockViewHeading,
		text: BlockViewTextarea,
		markdown: BlockViewMarkdown,
		quote: BlockViewQuote,
		divider: BlockViewDivider,
		youtube: BlockViewYoutube,
		table: TablePreview,
		diagram: BlockViewDiagram,
		callout: BlockViewCallout,
		code: BlockViewCode,
		link: BlockViewLinkCard,
	};
</script>

<script lang="ts">
	import {tick, untrack} from 'svelte';
	import {SortableList} from '../../data/sortable';
	import {getModalManager} from '../../overlays/modal';
	import {setBlockAPI} from './context.js';
	import type {Block, BlockAPI, BlockController} from './types.js';
	import BlockItem from './BlockItem.svelte';
	import BlockView from './BlockView.svelte';

	let {
		blocks = $bindable([]),
		components,
		joinable = '',
		typeLabels = {},
		previewComponents = defaultPreviewComponents,
		onchange,
	}: {
		blocks?: Block[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		components: Record<string, Component<any>>;
		joinable?: string;
		typeLabels?: Record<string, string>;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		previewComponents?: Record<string, Component<any>>;
		onchange?: (blocks: Block[]) => void;
	} = $props();

	const modalManager = getModalManager();

	const controllers = new Map<string, BlockController>();

	function generateId(): string {
		return crypto.randomUUID();
	}

	function findIndex(blockId: string): number {
		return blocks.findIndex(b => b.id === blockId);
	}

	// Emit onchange only on structural changes (add/remove/reorder — not updateData)
	let prevStructureKey = $state(untrack(() => blocks.map(b => b.id).join(',')));

	$effect(() => {
		const key = blocks.map(b => b.id).join(',');
		if (key !== untrack(() => prevStructureKey)) {
			untrack(() => {
				prevStructureKey = key;
			});
			onchange?.(blocks);
		}
	});

	function focusPrevController(fromIndex: number): void {
		for (let i = fromIndex - 1; i >= 0; i--) {
			const ctrl = controllers.get(blocks[i].id);
			if (ctrl) {
				ctrl.focus('end');
				return;
			}
		}
	}

	function focusNextController(fromIndex: number): void {
		for (let i = fromIndex + 1; i < blocks.length; i++) {
			const ctrl = controllers.get(blocks[i].id);
			if (ctrl) {
				ctrl.focus('start');
				return;
			}
		}
	}

	const api: BlockAPI = {
		get joinable() {
			return joinable;
		},

		split(blockId, newBlocksData) {
			const idx = findIndex(blockId);
			if (idx === -1) return;

			const newBlocks = newBlocksData.map(d => ({...d, id: generateId()}));
			blocks = [
				...blocks.slice(0, idx + 1),
				...newBlocks,
				...blocks.slice(idx + 1),
			];

			const firstId = newBlocks[0]?.id;
			if (firstId) {
				tick().then(() => controllers.get(firstId)?.focus('start'));
			}
		},

		joinWithPrev(blockId, cursorPos) {
			const idx = findIndex(blockId);
			if (idx <= 0) return;

			const prevId = blocks[idx - 1].id;
			blocks = blocks.filter((_, i) => i !== idx);
			tick().then(() => {
				const ctrl = controllers.get(prevId);
				if (cursorPos !== undefined && ctrl?.focusAt) {
					ctrl.focusAt(cursorPos);
				} else {
					ctrl?.focus('end');
				}
			});
		},

		joinWithNext(blockId, cursorPos) {
			const idx = findIndex(blockId);
			if (idx === -1 || idx >= blocks.length - 1) return;

			const nextId = blocks[idx + 1].id;
			blocks = blocks.filter((_, i) => i !== idx);
			tick().then(() => {
				const ctrl = controllers.get(nextId);
				if (cursorPos !== undefined && ctrl?.focusAt) {
					ctrl.focusAt(cursorPos);
				} else {
					ctrl?.focus('start');
				}
			});
		},

		updateData(blockId, newData) {
			blocks = blocks.map(b => b.id === blockId ? {...b, data: newData} : b);
		},

		insertAfter(blockId, newBlockData) {
			const idx = findIndex(blockId);
			const newBlock = {...newBlockData, id: generateId()};
			if (idx === -1) {
				blocks = [...blocks, newBlock];
			} else {
				blocks = [
					...blocks.slice(0, idx + 1),
					newBlock,
					...blocks.slice(idx + 1),
				];
			}
			tick().then(() => controllers.get(newBlock.id)?.focus('start'));
		},

		deleteBlock(blockId) {
			const idx = findIndex(blockId);
			if (idx === -1) return;

			const prevId = idx > 0 ? blocks[idx - 1].id : null;
			const nextId = idx < blocks.length - 1 ? blocks[idx + 1].id : null;

			blocks = blocks.filter(b => b.id !== blockId);

			if (prevId) {
				tick().then(() => controllers.get(prevId)?.focus('end'));
			} else if (nextId) {
				tick().then(() => controllers.get(nextId)?.focus('start'));
			}
		},

		getBlock(blockId) {
			return blocks.find(b => b.id === blockId);
		},

		getPrevBlock(blockId) {
			const idx = blocks.findIndex(b => b.id === blockId);
			return idx > 0 ? blocks[idx - 1] : undefined;
		},

		getNextBlock(blockId) {
			const idx = blocks.findIndex(b => b.id === blockId);
			return idx !== -1 && idx < blocks.length - 1 ? blocks[idx + 1] : undefined;
		},

		focusNext(currentBlockId) {
			const idx = findIndex(currentBlockId);
			if (idx === -1) return;
			focusNextController(idx);
		},

		focusPrev(currentBlockId) {
			const idx = findIndex(currentBlockId);
			if (idx === -1) return;
			focusPrevController(idx);
		},

		register(blockId, controller) {
			controllers.set(blockId, controller);
		},

		unregister(blockId) {
			controllers.delete(blockId);
		},
	};

	export function openPreview() {
		modalManager.open(BlockView, {blocks, previewComponents});
	}

	// ── Collapse state ──────────────────────────────────────────────────────────
	let collapsedIds = $state<Record<string, boolean>>({});

	function toggleCollapse(id: string) {
		collapsedIds = {...collapsedIds, [id]: !collapsedIds[id]};
	}

	export function openAll() {
		collapsedIds = {};
	}

	export function closeAll() {
		collapsedIds = Object.fromEntries(blocks.map(b => [b.id, true]));
	}

	// ── Move up / down ──────────────────────────────────────────────────────────
	function moveUp(blockId: string) {
		const idx = blocks.findIndex(b => b.id === blockId);
		if (idx <= 0) return;
		const next = [...blocks];
		[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
		blocks = next;
	}

	function moveDown(blockId: string) {
		const idx = blocks.findIndex(b => b.id === blockId);
		if (idx === -1 || idx >= blocks.length - 1) return;
		const next = [...blocks];
		[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
		blocks = next;
	}

	setBlockAPI(api);
</script>

<div class="space-y-2">

	{#if blocks.length === 0}
		<div class="flex items-center justify-center p-8 text-muted-contrast text-sm border border-dashed border-frame rounded-lg">
			No blocks yet.
		</div>
	{:else}
		<SortableList bind:items={blocks} id="block-editor" class="gap-1" dragHandleSelector="[data-drag-handle]">
			{#snippet item(block)}
				{@const idx = blocks.findIndex(b => b.id === block.id)}
				{@const isFirst = idx === 0}
				{@const isLast = idx === blocks.length - 1}
				<BlockItem
					{block} {components} {typeLabels}
					collapsed={!!collapsedIds[block.id]}
					onToggleCollapse={() => toggleCollapse(block.id)}
					{isFirst} {isLast}
					onMoveUp={() => moveUp(block.id)}
					onMoveDown={() => moveDown(block.id)}
				/>
			{/snippet}
		</SortableList>
	{/if}
</div>
