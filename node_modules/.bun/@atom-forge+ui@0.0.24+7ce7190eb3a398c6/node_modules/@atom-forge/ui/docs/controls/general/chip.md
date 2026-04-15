# Chip

A compact inline badge for labels, statuses, and metadata. Supports semantic color variants and optional icon/slot decoration.

## Import

```sveltehtml
import { Chip } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Chip label text or content. |
| `color` | `'base' \| 'green' \| 'red' \| 'blue' \| 'yellow'` | `'base'` | Color variant. |
| `icon` | `IconDefinition` | — | Icon shown before the children. Overridden by `start` snippet. |
| `start` | `Snippet` | — | Custom leading slot (overrides `icon`). |
| `end` | `Snippet` | — | Custom trailing slot. |
| `class` | `string` | — | Extra Tailwind classes, merged via `twMerge`. |

---

## Variants

| Value | Appearance |
|-------|-----------|
| `base` | `use-secondary` semantic token |
| `green` | Green tones, dark-mode aware |
| `red` | Red tones, dark-mode aware |
| `blue` | Blue tones, dark-mode aware |
| `yellow` | Yellow tones, dark-mode aware |

---

## Usage

```sveltehtml
<Chip>Default</Chip>
<Chip color="green">Active</Chip>
<Chip color="red">Error</Chip>
<Chip color="blue">Info</Chip>
<Chip color="yellow">Warning</Chip>

<!-- With icon -->
<Chip color="green" icon={IconCheck}>Verified</Chip>

<!-- With end slot -->
<Chip>
  Draft
  {#snippet end()}
    <button onclick={remove}>×</button>
  {/snippet}
</Chip>
```
