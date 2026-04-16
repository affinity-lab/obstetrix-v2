# Progress Ring

A circular SVG progress indicator. Supports a single ring or multiple concentric rings. The progress arc animates smoothly when `value` changes via CSS `stroke-dashoffset` transition.

## Props

### Single ring

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value. |
| `max` | `number` | `100` | Maximum value. Percentage = `value / max × 100`. Value is clamped to [0, max]. |
| `color` | `string` | `var(--color-accent)` | Progress arc color. Also used as fallback in multi-ring mode. |
| `label` | `string` | `${Math.round(pct)}%` | Center text. Ignored when `children` snippet is provided. |
| `labelClass` | `string` | — | Extra classes on the default label. |

### Multi ring

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rings` | `RingDef[]` | — | Array of ring definitions. Each: `{ value, max?, color? }`. Drawn concentrically, outermost first. |
| `gap` | `number` | `4` | Gap in pixels between concentric rings. |

### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `120` | Outer diameter in pixels. |
| `strokeWidth` | `number` | `12` | Thickness of both arcs in pixels. |
| `trackColor` | `string` | `var(--color-secondary)` | Background track color. |
| `children` | `Snippet` | — | Custom center content. Overrides the default label. No parameters — use local state directly. |
| `class` | `string` | — | Classes on the root element. |

## Types

```ts
type RingDef = {
  value: number;
  max?: number;    // defaults to 100
  color?: string;  // falls back to the `color` prop
};
```

## Accessibility

Root element: `role="progressbar"` with `aria-valuemin=0`, `aria-valuemax={max}`, `aria-valuenow={value}` (single-ring mode only). Pass `aria-label` to describe the metric.

## SVG internals

For ring at index `i`:
- `radius = (size - strokeWidth) / 2 - i * (strokeWidth + gap)`
- `circumference = 2π × radius`
- `stroke-dashoffset = circumference × (1 - percentage / 100)`
- Rotated −90° so arcs start at the top.

## Examples

```sveltehtml
<script>
  import { ProgressRing } from '$lib';
  let value = $state(65);
</script>

<!-- Default percentage label -->
<ProgressRing {value} />

<!-- Custom center content (no params — use local state) -->
<ProgressRing {value} color="#10b981">
  {#snippet children()}
    <span class="text-xl font-bold">{Math.round(value)}%</span>
  {/snippet}
</ProgressRing>

<!-- Multi-ring (Activity Rings style) -->
<ProgressRing
  size={160}
  strokeWidth={14}
  gap={6}
  rings={[
    { value: 78, color: '#ef4444' },
    { value: 52, color: '#10b981' },
    { value: 90, color: '#3b82f6' },
  ]}
/>
```
