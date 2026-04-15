# Splitter

A resizable split-panel container. The two panels are separated by a draggable divider. Supports vertical (side-by-side) and horizontal (stacked) orientations, touch events, and keyboard navigation.

## Import

```sveltehtml
import { Splitter } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | `vertical`: panels side by side. `horizontal`: panels stacked. |
| `initialSize` | `number` | `50` | Initial size of the start panel as a percentage. Frozen at mount. |
| `minSize` | `number` | `10` | Minimum size either panel can reach (percent). Enforced during drag and keyboard resize. |
| `class` | `string` | — | Extra CSS classes applied to the divider element. |
| `rootClass` | `string` | — | Extra CSS classes applied to the root container element. |
| `onresize` | `(detail: { start: number; end: number }) => void` | — | Fires continuously while the user drags the divider. |
| `onresizeend` | `(detail: { start: number; end: number }) => void` | — | Fires once when the user releases the divider. |

---

## Snippets

| Name | Required | Description |
|------|----------|-------------|
| `start` | Yes | Content of the first panel (left for vertical, top for horizontal). |
| `end` | Yes | Content of the second panel (right for vertical, bottom for horizontal). |
| `divider` | No | Custom divider handle. If omitted, a default thin line handle is shown. |

---

## Keyboard

When the divider is focused, arrow keys resize by 1% per press. Hold `Shift` for 10% steps.

| Orientation | Decrease | Increase |
|-------------|----------|----------|
| `vertical` | `←` | `→` |
| `horizontal` | `↑` | `↓` |

---

## Usage

```sveltehtml
<!-- Vertical (default) -->
<div class="h-64">
  <Splitter>
    {#snippet start()}
      <div class="p-4 h-full bg-canvas">Left</div>
    {/snippet}
    {#snippet end()}
      <div class="p-4 h-full">Right</div>
    {/snippet}
  </Splitter>
</div>

<!-- Horizontal, custom initial size -->
<div class="h-64">
  <Splitter orientation="horizontal" initialSize={35}>
    {#snippet start()}
      <div class="p-4">Top</div>
    {/snippet}
    {#snippet end()}
      <div class="p-4">Bottom</div>
    {/snippet}
  </Splitter>
</div>

<!-- Custom divider style + resize callback -->
<div class="h-64">
  <Splitter
    initialSize={30}
    minSize={20}
    class="w-2 bg-accent/10 hover:bg-accent/30 cursor-col-resize"
    onresizeend={(d) => console.log(d)}
  >
    {#snippet start()}
      <div class="p-4 h-full bg-canvas">Sidebar</div>
    {/snippet}
    {#snippet end()}
      <div class="p-4 h-full">Content</div>
    {/snippet}
  </Splitter>
</div>
```
