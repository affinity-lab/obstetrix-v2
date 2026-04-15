# ColorPicker

A styled color input that shows a swatch and the current hex value. Wraps the native `<input type="color">` with a design-system-consistent appearance.

## Import

```sveltehtml
import { ColorPicker } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'#ffffff'` | Bindable hex color string. |
| `disabled` | `boolean` | — | Disables the picker. |
| `compact` | `boolean` | — | Compact size (h-8). Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size (h-6). Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra Tailwind classes, merged via `twMerge`. |

---

## Sizes

| Size | Height |
|------|--------|
| normal | `h-10` |
| `compact` | `h-8` |
| `small` | `h-6` |

---

## Usage

```sveltehtml
<script>
  let color = $state('#3b82f6');
</script>

<ColorPicker bind:value={color}/>
<ColorPicker bind:value={color} compact/>
<ColorPicker bind:value={color} disabled/>
```
