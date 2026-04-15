# Sortable (DnD)

Drag-and-drop sortable lists built on [@atlaskit/pragmatic-drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop). Supports single-list reordering, multi-list item transfer, custom drag previews, and a handle-only drag mode.

## Import

```sveltehtml
import { SortableList, SortableGroup, DropIndicator, dnd } from '@atom-forge/ui';
```

Items must have a unique `id: string | number` field.

---

## SortableList

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | — | Bindable array of items. Mutated in place on drop. |
| `id` | `string` | `'default-list'` | Unique identifier for this list. Required when used inside a `SortableGroup`. |
| `item` | `Snippet<[T]>` | — | Snippet rendered for each item. |
| `orientation` | `'vertical' \| 'horizontal' \| 'grid'` | `'vertical'` | Affects drop edge detection and default indicator direction. |
| `grabbedClass` | `string` | — | Tailwind classes added to the clone shown as the native drag preview. |
| `previewOffset` | `(args) => {x, y}` | — | Custom cursor offset for the drag preview. |
| `dragHandleSelector` | `string` | — | CSS selector for a handle element inside each item. Drag starts only from that element. |
| `dropIndicator` | `Snippet<[T \| undefined]>` | — | Custom drop indicator snippet. Receives the item being dragged. |
| `empty` | `{ icon, title, description? }` | — | Shown via `EmptyState` when the list is empty. |
| `class` | `string` | — | Added to the list wrapper `<div>`. |

### Basic usage

```sveltehtml
<script lang="ts">
  import { SortableList } from '@atom-forge/ui';

  let tasks = $state([
    { id: 1, title: 'Design' },
    { id: 2, title: 'Develop' },
    { id: 3, title: 'Test' },
  ]);
</script>

<SortableList bind:items={tasks}>
  {#snippet item(task)}
    <div class="p-3 bg-control rounded border border-frame">
      {task.title}
    </div>
  {/snippet}
</SortableList>
```

### Drag handle

Only trigger drag from a specific element inside the item:

```sveltehtml
<SortableList bind:items={tasks} dragHandleSelector="[data-handle]">
  {#snippet item(task)}
    <div class="flex items-center gap-2 p-3 bg-control rounded border border-frame">
      <GripVertical data-handle class="cursor-grab text-muted-c" />
      <span>{task.title}</span>
    </div>
  {/snippet}
</SortableList>
```

### Custom drag preview

```sveltehtml
<SortableList
  bind:items={tasks}
  grabbedClass="shadow-xl ring-2 ring-accent"
>
  ...
</SortableList>
```

### Custom drop indicator

```sveltehtml
<SortableList bind:items={tasks}>
  {#snippet item(task)}...{/snippet}

  {#snippet dropIndicator(draggingItem)}
    <div class="h-1 rounded-full bg-accent mx-2"></div>
  {/snippet}
</SortableList>
```

---

## SortableGroup — cross-list transfer

Wrap multiple `SortableList`s in a `SortableGroup` to allow items to be dragged between lists. Each list must have a unique `id`.

```sveltehtml
<script lang="ts">
  import { SortableList, SortableGroup } from '@atom-forge/ui';

  let todo  = $state([{ id: 1, title: 'Plan' }, { id: 2, title: 'Design' }]);
  let doing = $state([{ id: 3, title: 'Develop' }]);
  let done  = $state([{ id: 4, title: 'Deploy' }]);
</script>

<SortableGroup class="flex gap-4">
  <SortableList id="todo"  bind:items={todo}  ...>...</SortableList>
  <SortableList id="doing" bind:items={doing} ...>...</SortableList>
  <SortableList id="done"  bind:items={done}  ...>...</SortableList>
</SortableGroup>
```

### Transfer rules

By default every list accepts items from any other list. Restrict this with `rules`:

```sveltehtml
<SortableGroup rules={{
  done:  { accepts: ['task'] },
  trash: { accepts: false },
}}>
```

Each list's items are matched by their `type` field (configurable via `typeField` prop on `SortableGroup`).

### SortableGroup props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rules` | `GroupRules` | — | Per-list accept rules. Omit to allow all transfers. |
| `typeField` | `string` | `'type'` | Item field used for rule matching. |
| `class` | `string` | — | Added to the wrapper `<div>`. |

---

## DropIndicator

A thin accent-colored line that acts as its own drop target zone. Useful for fixed insert points (e.g. between sections).

```sveltehtml
<DropIndicator
  active={isOver}
  horizontal={false}
  listId="my-list"
  onenter={() => isOver = true}
  onleave={() => isOver = false}
  ondrop={(source, location) => handleDrop(source)}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `active` | `boolean` | `false` | Shows the indicator line when `true`. |
| `horizontal` | `boolean` | `false` | Renders a vertical line instead of horizontal. |
| `listId` | `string` | `''` | Passed in drop payload so the parent can identify the target. |
| `onenter` | `() => void` | — | Called when a draggable enters the zone. |
| `onleave` | `() => void` | — | Called when a draggable leaves the zone. |
| `ondrop` | `(source, location) => void` | — | Called on drop. |

---

## `dnd` — low-level actions

The `dnd` object exposes the underlying Svelte actions and async module loaders for advanced use cases.

```ts
import { dnd } from '@atom-forge/ui';
```

### Actions (use in templates)

```sveltehtml
<div use:dnd.draggable={{ data: { id: item.id }, onDragStart: handleStart }}>
<div use:dnd.dropTarget={{ getData: () => ({ id }), onDrop: handleDrop }}>
```

### Async loaders

```ts
const monitorForElements = await dnd.getMonitor();
const setCustomNativeDragPreview = await dnd.getPreview();
const pointerOutsideOfPreview = await dnd.getPointerOffset();
```

These lazy-load the underlying `@atlaskit/pragmatic-drag-and-drop` modules on first call and cache the result.

#### `dnd.draggable` options

| Option | Type | Description |
|--------|------|-------------|
| `data` | `Record<string, unknown>` | Payload attached to the drag source. |
| `dragHandle` | `Element` | Direct reference to a handle element. |
| `dragHandleSelector` | `string` | CSS selector resolved inside the draggable element. |
| `canDrag` | `(args) => boolean` | Called before drag starts; return `false` to prevent. |
| `onGenerateDragPreview` | `(args) => void` | Called to render a custom native drag preview. |
| `onDragStart` | `(args) => void` | Called when dragging begins. |
| `onDrop` | `(args) => void` | Called when the drag ends (regardless of where). |

#### `dnd.dropTarget` options

| Option | Type | Description |
|--------|------|-------------|
| `getData` | `({ input, element }) => Record<string, unknown>` | Returns data attached to this drop target. |
| `canDrop` | `(args) => boolean` | Return `false` to reject a draggable. |
| `onDragEnter` | `(args) => void` | Called when a draggable enters. |
| `onDragLeave` | `(args) => void` | Called when a draggable leaves. |
| `onDrag` | `(args) => void` | Called continuously while dragging over. |
| `onDrop` | `(args) => void` | Called on drop. |
