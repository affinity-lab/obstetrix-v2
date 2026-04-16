# Empty State

A centered placeholder shown when a list or section has no content. Combines an icon, title, optional description, and an optional call-to-action slot.

## Import

```sveltehtml
import { EmptyState } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `IconDefinition` | — | Icon rendered above the title. Use `defineIcon()`. |
| `title` | `string` | — | Primary message. |
| `description` | `string` | — | Optional supporting text. |
| `children` | `Snippet` | — | Optional CTA area (e.g. a Button). |
| `class` | `string` | — | Extra Tailwind classes on the root `div`. |

---

## Usage

```sveltehtml
<!-- Minimal -->
<EmptyState icon={defineIcon(IconInbox)} title="No messages"/>

<!-- With description -->
<EmptyState
  icon={defineIcon(IconSearch)}
  title="No results"
  description="Try adjusting your search or filters."
/>

<!-- With CTA -->
<EmptyState
  icon={defineIcon(IconFilePlus)}
  title="No documents yet"
  description="Create your first document."
>
  <Button accent icon={defineIcon(IconFilePlus)} label="New Document"/>
</EmptyState>
```
