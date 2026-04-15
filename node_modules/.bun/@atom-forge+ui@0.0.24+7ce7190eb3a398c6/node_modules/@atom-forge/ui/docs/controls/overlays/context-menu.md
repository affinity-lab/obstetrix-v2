# ContextMenu

A popup menu built from a declarative config array. Supports icons, separators, warning styles, submenus, and programmatic resolution via the popup manager.

## Import

```sveltehtml
import { ContextMenu, getPopupManager } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `ContextMenuItemConfig[]` | Array of menu item definitions. |

---

## Item Config Types

Each item in the `config` array is one of:

### Separator

```ts
{ separator: true }
```

Renders a horizontal divider.

### Base item fields (shared)

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Item text. |
| `icon` | `IconDefinition` | Optional leading icon. |
| `warning` | `boolean` | Renders the label in `text-destructive`. |
| `disabled` | `boolean` | Greys out and disables the item. |
| `chevron` | `boolean` | Forces a chevron icon on the right (auto-shown for submenus). |

### OnclickItem

```ts
{ label, onclick: (event: MouseEvent, manager: PopupManager) => void }
```

### SubmenuItem

```ts
{ label, submenu: ContextMenuItemConfig[] }
```

Opens a nested `ContextMenu` aligned to the side on click.

### ResolverItem

```ts
{ label, resolveWith: any }
```

Closes the popup chain and resolves the awaited promise with `resolveWith`.

---

## Usage

```sveltehtml
<script>
  const popupManager = getPopupManager();

  async function open(event: MouseEvent) {
    const result = await popupManager.open.component(ContextMenu, {
      config: [
        { label: 'Edit', icon: IconEdit, onclick: () => edit() },
        { label: 'Duplicate', onclick: () => duplicate() },
        { separator: true },
        { label: 'Delete', icon: IconTrash, warning: true, onclick: () => remove() },
      ]
    }, { anchor: event });
  }
</script>

<button oncontextmenu|preventDefault={open}>Right-click me</button>
```

### With submenu

```sveltehtml
{
  label: 'Move to',
  submenu: [
    { label: 'Folder A', onclick: () => moveTo('a') },
    { label: 'Folder B', onclick: () => moveTo('b') },
  ]
}
```

### With resolver (for use inside a popup)

```sveltehtml
{ label: 'Confirm', resolveWith: true }
{ label: 'Cancel',  resolveWith: false }
```
