# MeterGroup & MeterGroupLegend

A segmented horizontal (or vertical) bar that visualises proportions within a total. Each segment represents a category sized by its value. The `MeterGroupLegend` component displays labels and values for the same dataset.

## MeterGroup

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MeterItem[]` | required | Segments to display. |
| `max` | `number` | sum of values | Total representing 100%. If greater than the sum, the remainder is shown in a neutral fill. |
| `vertical` | `boolean` | — | Renders the bar vertically. Set height via `class`; size props control width. |
| `compact` | `boolean` | — | Compact size — thinner bar. |
| `small` | `boolean` | — | Small size — thinnest bar. |
| `segment` | `Snippet<[MeterItem]>` | — | Inner content for each segment (e.g. tooltip). |
| `onsegmentclick` | `(item: MeterItem) => void` | — | Called on segment click. |
| `segmentClass` | `string` | — | Extra classes on every segment element. |
| `class` | `string` | — | Classes on the root element (use for height/radius). |

### MeterItem type

```ts
type MeterItem = {
  id: string;
  label: string;
  value: number;
  color: string; // any valid CSS color
};
```

### Sizes

| Size | Horizontal (height) | Vertical (width) |
|------|---------------------|------------------|
| normal (default) | `h-4` | `w-4` |
| compact | `h-3` | `w-3` |
| small | `h-2` | `w-2` |

Override with `class` to set an arbitrary size.

### Accessibility

The root div has `role="meter"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. Additional attributes (e.g. `aria-label`) can be passed directly via props.

## MeterGroupLegend

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MeterItem[]` | required | Same array as MeterGroup. |
| `vertical` | `boolean` | — | Stacks items vertically with values pushed to the right. |
| `compact` | `boolean` | — | Compact size — smaller text and swatch. |
| `small` | `boolean` | — | Small size — smallest text and swatch. |
| `showValues` | `boolean` | `true` | Show numeric values next to labels. |
| `item` | `Snippet<[MeterItem]>` | — | Replaces the entire list item. |
| `value` | `Snippet<[MeterItem]>` | — | Replaces only the value portion. |
| `onitemclick` | `(item: MeterItem) => void` | — | Called on legend item click. |
| `itemClass` | `string` | — | Classes on each `<li>`. |
| `swatchClass` | `string` | — | Classes on the color swatch. |
| `labelClass` | `string` | — | Classes on label text. |
| `valueClass` | `string` | — | Classes on value text. |
| `class` | `string` | — | Classes on the root `<ul>`. |

## Example

```sveltehtml
<script>
  import { MeterGroup, MeterGroupLegend } from '$lib';

  const items = [
    { id: 'docs', label: 'Documents', value: 25, color: '#3b82f6' },
    { id: 'photos', label: 'Photos', value: 40, color: '#10b981' },
    { id: 'apps', label: 'Apps', value: 15, color: '#f59e0b' },
  ];
</script>

<!-- Horizontal -->
<MeterGroup {items} class="h-4" />
<MeterGroupLegend {items} />

<!-- Vertical -->
<MeterGroup {items} vertical class="h-40" />
<MeterGroupLegend {items} vertical />

<!-- Sizes -->
<MeterGroup {items} compact />
<MeterGroupLegend {items} compact />
```
