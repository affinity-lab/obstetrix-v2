# Popup

A floating overlay system for anchored, temporary content — context menus, dropdowns, submenus, tooltips. Supports cursor and element anchoring, smart viewport-aware positioning, promise-based results, and nested popup hierarchies.

---

## Components & Exports

| Export | Description |
|--------|-------------|
| `PopupContainer` | Renders the active popup. Place one globally (handled by `AtomForge`) or wrap content for a scoped child manager. |
| `createPopupManager()` | Creates a `PopupManager` and registers it in Svelte context. Called automatically by `AtomForge`. |
| `getPopupManager()` | Returns the nearest `PopupManager` from Svelte context. |
| `PopupManager` | Class managing popup state, opening, closing, and resolve logic. |

---

## Setup

`AtomForge` handles global setup automatically — no manual configuration needed.

```sveltehtml
<!-- src/routes/+layout.svelte -->
<AtomForge>
  {@render children()}
</AtomForge>
```

For manual setup (without `AtomForge`):

```sveltehtml
<script>
  import { createPopupManager, PopupContainer } from '@atom-forge/ui';
  createPopupManager();
</script>

{@render children()}
<PopupContainer />
```

---

## PopupManager API

### `open.snippet(snippet, params, args, ref?)`

Opens a popup rendering a Svelte snippet.

```sveltehtml
<script>
  const popupManager = getPopupManager();
</script>

{#snippet myPopup(data)}
  <Card class="p-4">Hello, {data.name}!</Card>
{/snippet}

<Button onclick={e => popupManager.open.snippet(myPopup, { name: 'World' }, { anchor: e })} label="Open"/>
```

### `open.component(component, params, args, ref?)`

Opens a popup rendering a Svelte component. Useful when the popup is defined in a separate file.

```sveltehtml
import MyDropdown from './MyDropdown.svelte';
popupManager.open.component(MyDropdown, { items }, { anchor: event, align: 'left' });
```

Both methods return a `Promise<any>` that resolves when the popup closes.

---

## Closing & Resolving

| Method | Description |
|--------|-------------|
| `close()` | Closes the popup. Resolves the promise with `undefined`. |
| `resolve(value?)` | Closes the popup and resolves the promise with `value`. |
| `closeRoot()` | In nested popups, closes the entire stack from the root manager. |
| `resolveRoot(value?)` | In nested popups, resolves the root manager's promise with `value`. |

```sveltehtml
<!-- Inside a popup snippet -->
<Button label="Confirm" onclick={() => popupManager.resolve('confirmed')}/>
<Button label="Cancel" ghost onclick={() => popupManager.close()}/>
```

### Awaiting results

```sveltehtml
const result = await popupManager.open.snippet(myPopup, {}, { anchor: event });
if (result === 'confirmed') { /* handle */ }
```

---

## Positioning args

The third parameter of `open.snippet` / `open.component` controls positioning.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `pos` | `{ clientX, clientY }` | — | Positions the popup at the cursor. Mutually exclusive with `anchor`. |
| `anchor` | `Element \| MouseEvent` | — | Positions the popup relative to a DOM element. Passing a `MouseEvent` uses its `currentTarget`. |
| `align` | `'auto' \| 'left' \| 'right' \| 'both' \| 'side'` | `'auto'` | Horizontal alignment. See below. |
| `offset` | `number` | `4` | Pixel gap between the popup and anchor/cursor. |
| `ref` | `any` | — | Deduplication key — if a popup with the same ref is already open, the call is a no-op. |

### Alignment modes

| Value | Behavior |
|-------|----------|
| `auto` | Left-aligns if anchor is in the left half of the screen, right-aligns otherwise. |
| `left` | Aligns the popup's left edge to the anchor's left edge. |
| `right` | Aligns the popup's right edge to the anchor's right edge. |
| `both` | Popup matches the anchor's width (min-width). Ideal for full-width dropdowns. |
| `side` | Opens to the right or left of the anchor, aligned to its top or bottom edge. Used for submenus. |

Vertical position is always auto: opens below if the anchor is in the top half of the viewport, above otherwise.

---

## Nested Popups

Wrap popup content in `<PopupContainer>` to create an isolated child manager. The child manager can open its own popups independently. Use `resolveRoot()` to propagate a result up to the root promise.

```sveltehtml
{#snippet mainMenu()}
  <PopupContainer>
    {@const popupManager = getPopupManager()}
    <Card class="p-1 flex flex-col gap-0">
      <Button ghost compact label="Action" onclick={() => popupManager.resolveRoot('action')}/>
      <Button ghost compact label="Submenu" endIcon={IconChevronRight}
              onclick={e => popupManager.open.snippet(subMenu, {}, { anchor: e, align: 'side' }, subMenu)}/>
    </Card>
  </PopupContainer>
{/snippet}
```

The `ref` parameter on the submenu open call prevents flickering — if the submenu is already open, repeated `onclick` calls are ignored.

---

## Architecture

```
AtomForge
  └── createPopupManager()          → root PopupManager in context
       └── PopupContainer (global)  → renders root popup

Inside a popup snippet:
  PopupContainer (scoped)
    └── createPopupManager(parent)  → child PopupManager in context
         └── PopupContainer         → renders child popup
```

- The root `PopupContainer` listens for `window` click/contextmenu events to close the popup.
- Each scoped `PopupContainer` adds its own listener, so clicking inside a child popup doesn't bubble to close the parent (click propagation is stopped on the popup element).
- `ignoreClose` + a 100ms timeout prevents the open call from being immediately cancelled by the same click event.
- Positioning is recalculated every animation frame while an anchored popup is open, so it tracks scroll/resize correctly.
