<script lang="ts" generics="T extends { id: string | number }">
	import {twMerge} from "tailwind-merge";
	import {dnd} from "../../../helpers/actions";
	import {getContext, onMount} from "svelte";
	import type {GroupContext} from "./SortableGroup.svelte";
	import type {Snippet} from "svelte";
	import EmptyState from "../../display/empty-state/EmptyState.svelte";
	import DropSlot from "./DropSlot.svelte";
	import type {IconDefinition} from "../../general/icon";

	// Stubs replaced by real implementations in onMount (never called during SSR)
	let attachClosestEdge: typeof import('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge').attachClosestEdge = (data) => data as any;
	let extractClosestEdge: typeof import('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge').extractClosestEdge = () => null;
	let setCustomNativeDragPreview: Awaited<ReturnType<typeof dnd.getPreview>> = () => {};
	let pointerOutsideOfPreview: Awaited<ReturnType<typeof dnd.getPointerOffset>> = () => ({x: 0, y: 0}) as any;

	type Orientation = "vertical" | "horizontal" | "grid";

	interface EmptyStateProps {
		icon: IconDefinition;
		title: string;
		description?: string;
	}

	interface Props {
		class?: string;
		id?: string;
		items: T[];
		orientation?: Orientation;
		grabbedClass?: string;
		previewOffset?: (args: { container: HTMLElement }) => { x: number; y: number };
		/** CSS selector for a drag handle inside each item. If provided, drag starts only from that element. */
		dragHandleSelector?: string;
		item: Snippet<[T]>;
		dropIndicator?: Snippet<[T | undefined]>;
		empty?: EmptyStateProps;

		[key: string]: unknown;
	}

	let {
		class: classes,
		items = $bindable([]),
		id = "default-list",
		orientation = "vertical",
		grabbedClass,
		previewOffset,
		dragHandleSelector,
		item: itemSnippet,
		dropIndicator: dropIndicatorSnippet,
		empty,
		...props
	}: Props = $props();

	const groupCtx = getContext<GroupContext | undefined>("dnd-group");
	const registerToGroup = getContext<
		| ((
		listId: string,
		getItems: () => T[],
		setItems: (v: T[]) => void,
	) => () => void)
		| undefined
	>("dnd-group-register");

	onMount(() => {
		let cleanup: (() => void) | undefined;

		(async () => {
			const [hitbox, monitorForElements, preview, pointer] = await Promise.all([
				import('@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'),
				dnd.getMonitor(),
				dnd.getPreview(),
				dnd.getPointerOffset(),
			]);
			attachClosestEdge = hitbox.attachClosestEdge;
			extractClosestEdge = hitbox.extractClosestEdge;
			setCustomNativeDragPreview = preview;
			pointerOutsideOfPreview = pointer;

			const unmonitor = monitorForElements({
				onDrop: () => {
					insertIndex = -1;
					draggingId = null;
					dropHandled = false;
				},
				onDragStart: ({source}) => {
					if (source.data.listId === id) {
						draggingId = source.data.id as string | number;
					}
				},
			});

			if (registerToGroup) {
				const unregister = registerToGroup(
					id,
					() => items,
					(newItems) => { items = newItems as T[]; },
				);
				cleanup = () => { unmonitor(); unregister(); };
			} else {
				cleanup = unmonitor;
			}
		})();

		return () => cleanup?.();
	});

	const isHorizontal = $derived(
		orientation === "horizontal" || orientation === "grid",
	);

	let insertIndex = $state(-1);
	let draggingId = $state<string | number | null>(null);
	let dropHandled = false;

	const cls = $derived(
		twMerge(
			"flex",
			orientation === "vertical" ? "flex-col" : "flex-row",
			orientation === "grid" ? "flex-wrap" : "",
			classes,
		),
	);

	// --- Utility: reorder same-list ---
	function reorder(sourceId: string | number, toIndex: number) {
		const startIndex = items.findIndex((i) => i.id === sourceId);
		console.log(`[DnD] reorder | list="${id}" | item="${sourceId}" | startIndex=${startIndex} → toIndex=${toIndex}`);
		if (startIndex === -1) {
			console.warn('  ❌ item not found');
			return;
		}
		if (toIndex === startIndex || toIndex === startIndex + 1) {
			console.log('  ↩ no-op (same position)');
			return;
		}
		const newItems = [...items];
		const [moved] = newItems.splice(startIndex, 1);
		const insertAt = toIndex > startIndex ? toIndex - 1 : toIndex;
		newItems.splice(insertAt, 0, moved);
		console.log('  ✅ reordered:', newItems.map((i: any) => i.id));
		items = newItems;
	}

	// --- Utility: cross-list move ---
	function crossListMove(sourceId: string | number, sourceListId: string, toIndex: number) {
		console.log(`[DnD] crossListMove | "${sourceListId}" → "${id}" | item="${sourceId}" | toIndex=${toIndex}`);
		if (!groupCtx) {
			console.warn('  ❌ no groupCtx');
			return;
		}
		groupCtx.onCrossListDrop({
			sourceListId,
			targetListId: id,
			itemId: sourceId,
			targetIndex: toIndex,
		});
	}

	// Compute candidate insertIndex — returns -1 if same-list no-op.
	function computeInsertIndex(itemIdx: number, edge: string | null): number {
		const candidate = edge === "top" || edge === "left" ? itemIdx : itemIdx + 1;
		if (draggingId !== null) {
			const srcIdx = items.findIndex((i) => i.id === draggingId);
			if (srcIdx !== -1 && (candidate === srcIdx || candidate === srcIdx + 1)) return -1;
		}
		return candidate;
	}

	// --- Item event handlers ---
	const GRABBED_PADDING = 24;

	function handleDragStart({source, nativeSetDragImage}: any) {
		const padding = grabbedClass ? GRABBED_PADDING : 0;
		// Default offset compensates for the padding so the preview appears at
		// the same position relative to the cursor with or without grabbedClass.
		const defaultOffset = grabbedClass
			? () => ({x: GRABBED_PADDING - 16, y: GRABBED_PADDING - 8})
			: pointerOutsideOfPreview({x: '16px', y: '8px'});
		setCustomNativeDragPreview({
			nativeSetDragImage,
			getOffset: previewOffset ?? defaultOffset,
			render({container}: { container: HTMLElement }) {
				const el = document.querySelector(
					`[data-dnd-id="${source.data.id}"][data-dnd-list="${id}"]`
				);
				if (el) {
					const inner = el.firstElementChild;
					const clone = (inner ?? el).cloneNode(true) as HTMLElement;
					if (grabbedClass) {
						container.style.padding = `${padding}px`;
						clone.className = twMerge(clone.className, grabbedClass);
					}
					container.appendChild(clone);
				}
			},
		});
	}

	function handleItemDragEnter({self, source}: any) {
		if (source.data.id === self.data.id) return;
		const edge = extractClosestEdge(self.data);
		const idx = items.findIndex((i) => i.id === self.data.id);
		if (idx === -1) return;
		const candidate = computeInsertIndex(idx, edge);
		if (candidate !== -1) insertIndex = candidate;
	}

	function handleItemDrag({self, source}: any) {
		if (source.data.id === self.data.id) return;
		const edge = extractClosestEdge(self.data);
		const idx = items.findIndex((i) => i.id === self.data.id);
		if (idx === -1) return;
		insertIndex = computeInsertIndex(idx, edge);
	}

	function handleItemDragLeave() { /* intentionally empty */
	}

	function handleDrop({source}: any) {
		if (dropHandled) return;
		dropHandled = true;
		const toIndex = insertIndex !== -1 ? insertIndex : items.length;
		const sourceId = source.data.id;
		const sourceListId: string = source.data.listId;
		insertIndex = -1;
		draggingId = null;
		if (sourceListId === id) {
			reorder(sourceId, toIndex);
		} else {
			crossListMove(sourceId, sourceListId, toIndex);
		}
	}
</script>

<div
	class={cls}
	{...props}
	use:dnd.dropTarget={{
        getData: () => ({ listId: id, type: "list-container" }),
        onDragLeave: () => { insertIndex = -1; },
        onDrop: handleDrop,
    }}
>
	<DropSlot atIndex={0} {insertIndex} draggingItem={items.find(i => i.id === draggingId)} {orientation} {dropIndicatorSnippet}/>

	{#if items.length === 0 && empty}
		<EmptyState icon={empty.icon} title={empty.title} description={empty.description}/>
	{/if}

	{#each items as item, index (item.id)}
		<div
			class="transition-opacity duration-150"
			class:opacity-40={draggingId === item.id}
			data-dnd-id={item.id}
			data-dnd-list={id}
			use:dnd.draggable={{
                data: { id: item.id, index, listId: id, type: "list-item" },
                dragHandleSelector,
                onGenerateDragPreview: handleDragStart,
            }}
			use:dnd.dropTarget={{
                getData: ({ input, element }) =>
                    attachClosestEdge(
                        { id: item.id, index, listId: id, type: "list-item" },
                        {
                            element,
                            input,
                            allowedEdges: isHorizontal
                                ? ["left", "right"]
                                : ["top", "bottom"],
                        },
                    ),
                onDragEnter: handleItemDragEnter,
                onDrag: handleItemDrag,
                onDragLeave: handleItemDragLeave,
                onDrop: handleDrop,
            }}
		>
			{@render itemSnippet(item)}
		</div>

		<DropSlot atIndex={index + 1} {insertIndex} draggingItem={items.find(i => i.id === draggingId)} {orientation} {dropIndicatorSnippet}/>
	{/each}

</div>
