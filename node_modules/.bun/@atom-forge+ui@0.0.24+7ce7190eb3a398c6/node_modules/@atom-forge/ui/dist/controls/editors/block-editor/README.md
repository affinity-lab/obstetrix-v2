# Block Editor

A modular, keyboard-driven block editor built on top of the atom-forge gem collection. Not a gem itself — it uses `SortableList`, `ContextMenu`, and `PopupManager` internally.

## Architecture

```
src/block-editor/
├── BlockEditor.svelte      # Motor: state, BlockAPI, DnD
├── BlockEditorItem.svelte  # Wrapper: toolbar + block content
├── context.ts              # Svelte context helpers
├── types.ts                # Block, BlockAPI, BlockController
├── index.ts                # Public exports
└── blocks/
    ├── TextareaBlock.svelte
    ├── HeadingBlock.svelte
    ├── QuoteBlock.svelte
    ├── DividerBlock.svelte
    └── YoutubeBlock.svelte
```

The editor is split into two layers:

- **`BlockEditor`** — owns the `blocks` array, implements `BlockAPI`, mounts a `SortableList` for drag-and-drop reordering.
- **`BlockEditorItem`** — renders a single block with a toolbar (drag handle, insert menu, type label, delete button) above the block component.

Block components receive the API via Svelte context (`getBlockAPI()`). They never import `BlockEditor` directly.

---

## Import

```ts
import {
  BlockEditor,
  BlockEditorItem,
  TextareaBlock,
  HeadingBlock,
  QuoteBlock,
  DividerBlock,
  YoutubeBlock,
  getBlockAPI,
} from '$block-editor';
import type { Block, BlockAPI, BlockController } from '$block-editor';
```

The path alias `$block-editor` → `src/block-editor` is defined in `svelte.config.js`.

---

## BlockEditor props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blocks` | `Block[]` | `[]` | Bindable array of blocks. |
| `components` | `Record<string, Component>` | — | Map of block type → Svelte component. |
| `joinable` | `string` | `''` | Block type that supports text-merge on keyboard join. |
| `typeLabels` | `Record<string, string>` | `{}` | Override display labels for block types (e.g. `{ youtube: 'YouTube' }`). |
| `onchange` | `(blocks: Block[]) => void` | — | Fires on structural changes (add/remove/reorder). Not fired by `updateData`. |

---

## Data types

```ts
type Block = {
  id: string;   // crypto.randomUUID()
  type: string; // must match a key in `components`
  data: any;    // block-specific payload
};
```

### Built-in block data shapes

| Type | `data` shape |
|------|-------------|
| `text` | `{ text: string }` |
| `heading` | `{ text: string; level: 1 \| 2 \| 3 }` |
| `quote` | `{ text: string }` |
| `divider` | `null` |
| `youtube` | `{ url: string; title?: string }` |

---

## Basic usage

```svelte
<script lang="ts">
  import BlockEditor from '$block-editor/BlockEditor.svelte';
  import TextareaBlock from '$block-editor/blocks/TextareaBlock.svelte';
  import HeadingBlock  from '$block-editor/blocks/HeadingBlock.svelte';
  import type { Block } from '$block-editor/types.js';

  const components = {
    text:    TextareaBlock,
    heading: HeadingBlock,
  };

  let blocks = $state<Block[]>([
    { id: '1', type: 'heading', data: { text: 'Hello', level: 1 } },
    { id: '2', type: 'text',    data: { text: 'Start writing...' } },
  ]);
</script>

<BlockEditor
  bind:blocks
  {components}
  joinable="text"
  typeLabels={{ youtube: 'YouTube' }}
  onchange={(b) => console.log('structure changed', b)}
/>
```

---

## BlockAPI

Block components access the API via context:

```ts
import { getBlockAPI } from '$block-editor/context.js';
const api = getBlockAPI();
```

### Block operations

| Method | Description |
|--------|-------------|
| `split(blockId, newBlocksData)` | Inserts new blocks after `blockId`. Focuses the first new block. |
| `joinWithPrev(blockId)` | Removes the block; focuses the previous block's end. |
| `joinWithNext(blockId)` | Removes the next block; focuses the next block's start. |
| `updateData(blockId, newData)` | Updates block data without triggering `onchange`. |
| `insertAfter(blockId, newBlockData)` | Inserts a new block after `blockId`; focuses it. |
| `deleteBlock(blockId)` | Removes the block; focuses the nearest neighbour. |
| `getBlock(blockId)` | Returns the block or `undefined`. |
| `getPrevBlock(blockId)` | Returns the previous block or `undefined`. |
| `getNextBlock(blockId)` | Returns the next block or `undefined`. |

### Focus operations

| Method | Description |
|--------|-------------|
| `focusNext(currentBlockId)` | Moves focus to the next registered controller. |
| `focusPrev(currentBlockId)` | Moves focus to the previous registered controller. |

### Controller registry

Block components must register a `BlockController` so focus routing works:

```ts
const controller: BlockController = {
  focus(direction: 'start' | 'end') {
    el.focus();
    const pos = direction === 'end' ? el.value.length : 0;
    el.setSelectionRange(pos, pos);
  },
};

$effect(() => {
  api.register(id, controller);
  return () => api.unregister(id);
});
```

### `joinable`

The `joinable` prop on `BlockEditor` names the block type that supports text merging on keyboard join. When `Backspace` is pressed at the start of a `text` block and the previous block is also `text`, their content is merged before the join — instead of simply removing the current block (which would lose its text).

---

## Writing a custom block component

A block component receives `id` and `data` as props. It calls `getBlockAPI()` to interact with the editor.

```svelte
<script lang="ts">
  import { untrack } from 'svelte';
  import { getBlockAPI } from '$block-editor/context.js';
  import type { BlockController } from '$block-editor/types.js';

  let { id, data }: { id: string; data: { text: string } | null } = $props();

  const api = getBlockAPI();

  // Freeze initial value to avoid `state_referenced_locally` warning
  let text = $state(untrack(() => data?.text ?? ''));
  let el = $state<HTMLTextAreaElement | undefined>(undefined);

  // Sync external changes (undo/redo, cross-block merges)
  $effect(() => {
    const incoming = data?.text;
    if (incoming !== undefined && incoming !== untrack(() => text)) {
      text = incoming;
    }
  });

  // Register focus controller
  $effect(() => {
    const controller: BlockController = {
      focus(direction) {
        if (!el) return;
        el.focus();
        const pos = direction === 'end' ? el.value.length : 0;
        el.setSelectionRange(pos, pos);
      },
    };
    api.register(id, controller);
    return () => api.unregister(id);
  });
</script>

<textarea bind:this={el} bind:value={text} oninput={() => api.updateData(id, { text })} />
```

**Important:**
- Always use `untrack()` when initialising `$state` from `data` to avoid reactivity warnings.
- Always call `api.register` / `api.unregister` in an `$effect` cleanup pair.
- Call `api.updateData` on every input — this does **not** fire `onchange`.

---

## Keyboard shortcuts (built-in blocks)

| Key | Condition | Action |
|-----|-----------|--------|
| `Enter` | In `HeadingBlock` | Split: heading keeps text before cursor, new `joinable` block gets text after |
| `Shift+Enter` | In `TextareaBlock` / `QuoteBlock` | Split block at cursor |
| `Backspace` | At start of block | Join with previous block (merge text if both are `joinable` type) |
| `Delete` | At end of block | Join next block into this one (merge text if both are `joinable` type) |
| `ArrowUp` | At start of block | Focus previous block |
| `ArrowDown` | At end of block | Focus next block |
| `Backspace` / `Delete` | In empty `DividerBlock` | Delete the divider block |
| `Escape` / `Backspace` (empty URL) | In `YoutubeBlock` | Delete the block |

---

## Undo / Redo

`BlockEditor` does not manage history internally. The `onchange` callback fires on every structural change, providing a snapshot hook:

```svelte
<script>
  let history      = $state([untrack(() => JSON.stringify(blocks))]);
  let historyIndex = $state(0);

  function handleChange(newBlocks) {
    history      = [...history.slice(0, historyIndex + 1), JSON.stringify(newBlocks)];
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex--;
    blocks = JSON.parse(history[historyIndex]);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex++;
    blocks = JSON.parse(history[historyIndex]);
  }
</script>

<svelte:window onkeydown={(e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) redo(); else undo();
  }
}} />

<BlockEditor bind:blocks {components} onchange={handleChange} />
```

Note: `updateData` (text edits within a block) does **not** fire `onchange`, so history only snapshots structural events (add, delete, reorder). Fine-grained text undo is handled natively by the browser within each input/textarea.
