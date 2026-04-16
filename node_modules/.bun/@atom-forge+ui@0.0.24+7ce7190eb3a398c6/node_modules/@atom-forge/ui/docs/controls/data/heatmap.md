# Heatmap

An SVG-based heatmap for visualizing 2D datasets with a color scale. Typical uses: activity calendars, correlation matrices, time-of-day patterns, score grids.

The chart is fully responsive via `viewBox` and adapts grid label and legend colors to the active theme (light/dark).

## Import

```sveltehtml
import { Heatmap, type HeatmapData, type HeatmapCell } from '@atom-forge/ui';
```

---

## Data structure

```ts
type HeatmapData = {
  xLabels: string[];   // column headers
  yLabels: string[];   // row headers
  values: number[][];  // values[y][x] — row-major order
};
```

The `values` array must have `yLabels.length` rows, each with `xLabels.length` entries. Min/max are computed automatically.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HeatmapData` | — | Required. Axis labels and cell values. |
| `colors` | `string[]` | `['#f0f0f0', '#22c55e']` | Hex color scale (minimum 2 stops). Interpolated linearly from min → max. |
| `showLegend` | `boolean` | `true` | Show the color bar legend below the grid. |
| `legendTitle` | `string` | `''` | Label shown above the legend bar. |
| `cellPadding` | `number` | `2` | Gap between cells (SVG units). |
| `cellBorderRadius` | `number` | `2` | Corner radius of each cell (SVG units). |
| `showRowLabels` | `boolean` | `true` | Show the Y-axis row labels on the left. |
| `showColLabels` | `boolean \| 'vertical'` | `true` | `false` = hide, `true` = horizontal (default), `'vertical'` = rotated 90°. |
| `class` | `string` | — | Extra classes on the root `<svg>` element. |
| `cellClass` | `string` | — | Extra classes applied to every cell `<rect>`. |
| `oncellClick` | `(detail: HeatmapCell) => void` | — | Fires when a cell is clicked or activated via keyboard. |
| `oncellHover` | `(detail: HeatmapCell) => void` | — | Fires when the mouse enters a cell. |

---

## Snippets

| Name | Params | Description |
|------|--------|-------------|
| `tooltip` | `HeatmapCell` | Custom tooltip. If omitted, a default card is shown. |

### HeatmapCell

```ts
type HeatmapCell = {
  xLabel: string;
  yLabel: string;
  value: number;
  x: number;   // column index
  y: number;   // row index
};
```

---

## Keyboard & A11y

- Each cell has `tabindex="0"` and `aria-label="{xLabel}, {yLabel}: {value}"`.
- Focused cells show an accent-colored stroke ring.
- `Enter` / `Space` triggers `oncellClick`.

---

## Usage

```sveltehtml
<script>
  const data = {
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    yLabels: ['Morning', 'Midday', 'Afternoon', 'Evening'],
    values: [
      [5, 10, 8, 12, 15, 2, 1],
      [15, 25, 20, 30, 35, 10, 5],
      [20, 30, 28, 35, 40, 15, 8],
      [8, 12, 10, 15, 18, 25, 22],
    ],
  };
</script>

<!-- Default green scale -->
<Heatmap {data} legendTitle="Activity" />

<!-- Multi-stop diverging scale -->
<Heatmap {data} colors={['#fef9c3', '#ca8a04', '#7c2d12']} legendTitle="Score" />

<!-- Custom tooltip + click handler -->
<Heatmap {data} oncellClick={(d) => console.log(d)}>
  {#snippet tooltip(cell)}
    <div class="bg-raised border border-base-b rounded-lg px-3 py-2 text-sm shadow-lg">
      <div class="font-semibold">{cell.yLabel}, {cell.xLabel}</div>
      <div class="text-accent">{cell.value}</div>
    </div>
  {/snippet}
</Heatmap>
```
