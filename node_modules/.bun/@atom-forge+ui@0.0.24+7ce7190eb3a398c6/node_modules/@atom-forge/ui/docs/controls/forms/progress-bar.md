# ProgressBar

A horizontal progress indicator with an accent fill, striped texture, and smooth width transition.

## Import

```sveltehtml
import { ProgressBar } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value. |
| `max` | `number` | `100` | Maximum value. Percentage = `value / max * 100`. |
| `compact` | `boolean` | — | Medium track height (`h-2.5`). Mutually exclusive with `small`. |
| `small` | `boolean` | — | Thin track height (`h-1.5`). Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra Tailwind classes on the track, merged via `twMerge`. |

---

## Sizes

| Size | Track height |
|------|-------------|
| normal | `h-4` |
| `compact` | `h-2.5` |
| `small` | `h-1.5` |

---

## Usage

```sveltehtml
<ProgressBar value={65}/>
<ProgressBar value={3} max={10}/>
<ProgressBar value={40} compact/>
<ProgressBar value={80} small/>

<!-- Animated -->
<script>
  let progress = $state(0);
  setInterval(() => { if (progress < 100) progress++ }, 50);
</script>
<ProgressBar {value} />
```
