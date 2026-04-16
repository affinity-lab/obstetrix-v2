# Breadcrumb

A navigation trail showing the current page's location within a hierarchy. Separated by `/`. The last item is always rendered as bold non-clickable text.

## Import

```sveltehtml
import { Breadcrumb } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | — | Ordered list of breadcrumb segments. Last item is always non-clickable. |
| `maxLabelLength` | `number` | — | Truncates each label to this many characters (appends `…`). |
| `maxSegments` | `number` | — | Collapses middle segments into a `…` button when the item count exceeds this. Clicking opens a context menu with the hidden items. |
| `class` | `string` | — | Extra Tailwind classes on the `<nav>` element. |

### BreadcrumbItem

```ts
type BreadcrumbItem = {
  label: string;
  href?: string;
  onclick?: (e: MouseEvent) => void;
};
```

---

## Usage

```sveltehtml
<Breadcrumb items={[
  { label: 'Home', href: '/' },
  { label: 'Settings', href: '/settings' },
  { label: 'Profile' },
]}/>
```

With truncation and collapsing:

```sveltehtml
<Breadcrumb
  maxLabelLength={20}
  maxSegments={3}
  items={breadcrumbs}
/>
```

### Notes

- The last item is always rendered as a non-clickable `<span>` regardless of `href`.
- Non-last items with `href` or `onclick` are rendered as `<a>` links.
- Non-last items without `href`/`onclick` are rendered as a disabled `<span>`.
- Long labels are truncated with `truncate max-w-32` (links) or `max-w-48` (current page).
- When `maxSegments` is set and exceeded, middle items collapse into a `…` button that opens a context menu.

