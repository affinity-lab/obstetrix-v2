# Card

A surface container with a rounded border and configurable shadow elevation. Uses the `raised` semantic color layer.

## Import

```sveltehtml
import { Card } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Card content. |
| `elevate` | `0–6` | `1` | Shadow level. `0` = no shadow, `6` = `shadow-2xl`. |
| `class` | `string` | — | Extra Tailwind classes, merged via `twMerge`. |

Shadow levels map to Tailwind: `0→none`, `1→sm`, `2→shadow`, `3→md`, `4→lg`, `5→xl`, `6→2xl`.

---

## Usage

```sveltehtml
<Card>
  <p class="p-4">Basic card with default shadow.</p>
</Card>

<Card elevate={3}>
  <p class="p-4">Medium shadow.</p>
</Card>

<Card elevate={0} class="p-6">
  <p>Flat card, no shadow.</p>
</Card>
```
