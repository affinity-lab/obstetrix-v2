# Charts (Chart.js)

Canvas-based chart components powered by [Chart.js](https://www.chartjs.org/). All components automatically adapt grid line and text label colors to the active theme (light/dark).

## Import

```ts
import { LineChart, CjsBarChart, PieChart, DoughnutChart, ScatterChart, BubbleChart, RadarChart } from '@atom-forge/ui';
```

> **Note:** `CjsBarChart` is the Chart.js bar chart. The CSS-only `BarChart` from the Diagrams section remains separate.

---

## Color palette

Series colors are assigned automatically from the built-in palette. The first color matches the accent token.

```ts
import { CHART_PALETTE, seriesColor } from '@atom-forge/ui';
// seriesColor(index, optionalOverride) → string
```

---

## LineChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | — | X-axis category labels. |
| `datasets` | `LineDataset[]` | — | Series data. |
| `smooth` | `boolean` | `false` | Bezier curve smoothing (tension 0.4). |
| `options` | `ChartOptions<'line'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |
| `class` | `string` | — | Extra classes on the canvas element. |

### LineDataset

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Series name shown in the legend. |
| `data` | `number[]` | One value per label. |
| `color` | `string` | Override the auto-assigned series color. |
| `fill` | `boolean` | Fill the area under the line (area chart). |

```sveltehtml
<LineChart
  labels={['Jan', 'Feb', 'Mar']}
  datasets={[
    { label: 'Revenue', data: [12000, 19000, 15000] },
    { label: 'Expenses', data: [8000, 11000, 9000] },
  ]}
/>

<!-- Smooth area chart -->
<LineChart
  labels={['Mon', 'Tue', 'Wed']}
  smooth
  datasets={[{ label: 'Visitors', data: [420, 380, 510], fill: true }]}
/>
```

---

## CjsBarChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | — | Category labels. |
| `datasets` | `BarDataset[]` | — | Series data. |
| `stacked` | `boolean` | `false` | Stack bars instead of grouping. |
| `horizontal` | `boolean` | `false` | Flip axes (horizontal bars). |
| `options` | `ChartOptions<'bar'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |
| `class` | `string` | — | Extra classes on the canvas element. |

### BarDataset

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Series name. |
| `data` | `number[]` | One value per category label. |
| `color` | `string` | Override the auto-assigned series color. |

```sveltehtml
<!-- Grouped (default) -->
<CjsBarChart
  labels={['Q1', 'Q2', 'Q3', 'Q4']}
  datasets={[
    { label: 'Product A', data: [4200, 5800, 4900, 6700] },
    { label: 'Product B', data: [3100, 4200, 5100, 4800] },
  ]}
/>

<!-- Stacked -->
<CjsBarChart labels={['Design', 'Eng']} stacked datasets={[...]} />

<!-- Horizontal -->
<CjsBarChart labels={['CSS', 'TS', 'Svelte']} horizontal datasets={[...]} />
```

---

## PieChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | — | Segment labels. |
| `data` | `number[]` | — | One value per label. |
| `colors` | `string[]` | — | Optional color overrides per segment. |
| `options` | `ChartOptions<'pie'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |

```sveltehtml
<PieChart
  labels={['Direct', 'Social', 'Email']}
  data={[35, 25, 18]}
/>
```

---

## DoughnutChart

Same as `PieChart` with an additional `cutout` prop.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | — | Segment labels. |
| `data` | `number[]` | — | One value per label. |
| `colors` | `string[]` | — | Optional color overrides. |
| `cutout` | `string \| number` | `'60%'` | Inner hole size as a percentage string or pixel number. |
| `options` | `ChartOptions<'doughnut'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |

```sveltehtml
<DoughnutChart
  labels={['Frontend', 'Backend', 'DevOps']}
  data={[40, 30, 18]}
  cutout="65%"
/>
```

---

## ScatterChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasets` | `ScatterDataset[]` | — | Series data. |
| `options` | `ChartOptions<'scatter'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |

### ScatterDataset

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Series name. |
| `data` | `{ x: number; y: number }[]` | Data points. |
| `color` | `string` | Override the auto-assigned series color. |

```sveltehtml
<ScatterChart
  datasets={[
    { label: 'Group A', data: [{ x: 2, y: 4 }, { x: 5, y: 8 }] },
    { label: 'Group B', data: [{ x: 1, y: 9 }, { x: 4, y: 3 }] },
  ]}
/>
```

---

## BubbleChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `datasets` | `BubbleDataset[]` | — | Series data. |
| `options` | `ChartOptions<'bubble'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |

### BubbleDataset

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Series name. |
| `data` | `{ x: number; y: number; r: number }[]` | Data points. `r` is the bubble radius in pixels. |
| `color` | `string` | Override the auto-assigned series color. |

```sveltehtml
<BubbleChart
  datasets={[
    { label: 'Products', data: [{ x: 10, y: 20, r: 8 }, { x: 30, y: 40, r: 14 }] },
  ]}
/>
```

---

## RadarChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `labels` | `string[]` | — | Axis labels around the radar. |
| `datasets` | `RadarDataset[]` | — | Series data. |
| `options` | `ChartOptions<'radar'>` | `{}` | Chart.js options escape hatch. |
| `chart` | `Chart` (bindable) | — | Underlying Chart.js instance. |

### RadarDataset

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Series name. |
| `data` | `number[]` | One value per axis label. |
| `color` | `string` | Override the auto-assigned series color. |
| `fill` | `boolean` | Fill the polygon area. Defaults to `true`. |

```sveltehtml
<RadarChart
  labels={['Speed', 'Strength', 'Stamina', 'Agility']}
  datasets={[
    { label: 'Warrior', data: [60, 90, 70, 55] },
    { label: 'Mage', data: [50, 30, 55, 65] },
  ]}
/>
```

---

## Programmatic access

Bind the `chart` prop to get the raw Chart.js instance:

```sveltehtml
<script lang="ts">
  import type { Chart } from 'chart.js';
  let chartInstance = $state<Chart | undefined>();
</script>

<LineChart labels={[...]} datasets={[...]} bind:chart={chartInstance} />

<button onclick={() => chartInstance?.resetZoom()}>Reset</button>
```

---

## Low-level base

`ChartBase` accepts a full `ChartConfiguration` object directly — useful when no high-level wrapper fits your needs:

```sveltehtml
import { ChartBase } from '@atom-forge/ui';
import type { ChartConfiguration } from 'chart.js';

const config: ChartConfiguration = { type: 'line', data: { ... }, options: { ... } };
```

```sveltehtml
<ChartBase {config} />
```
