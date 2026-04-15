# Slider / Range

`Slider` — single thumb for a scalar value. `Range` — two thumbs for an interval `[min, max]`. Both share the same visual and size API.

## Import

```sveltehtml
import { Slider, Range } from '@atom-forge/ui';
```

---

## Slider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `50` | Bindable current value. Clamped to `[min, max]` on mount. |
| `min` | `number` | `0` | Minimum value. |
| `max` | `number` | `100` | Maximum value. |
| `step` | `number` | `1` | Step increment. |
| `disabled` | `boolean` | — | Disables interaction. |
| `drawStops` | `boolean` | — | Draws tick marks at each step. |
| `compact` | `boolean` | — | Compact track size. Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small track size. Mutually exclusive with `compact`. |
| `showValue` | `boolean \| (value: number) => string` | — | Shows the current value in a bubble above the knob while dragging. Pass a formatter to add a unit, e.g. `v => v + ' %'`. |
| `class` | `string` | — | Extra Tailwind classes. |

---

## Range Props

Same as Slider, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `[number, number]` | `[25, 75]` | Bindable two-value interval. |
| `distance` | `{ min?: number; max?: number }` | — | Enforces a minimum and/or maximum distance between the two thumbs. |

---

## Usage

```sveltehtml
<script>
  let vol   = $state(60);
  let range = $state([20, 80]);
</script>

<!-- Slider -->
<Slider bind:value={vol}/>
<Slider bind:value={vol} min={0} max={200} step={10}/>
<Slider bind:value={vol} drawStops compact/>

<!-- Range -->
<Range bind:value={range}/>
<Range bind:value={range} distance={{ min: 10, max: 50 }}/>

<!-- showValue -->
<Slider bind:value={vol} showValue/>
<Slider bind:value={vol} showValue={v => v + ' %'}/>
<Range bind:value={range} showValue={v => v + ' kg'}/>
```
