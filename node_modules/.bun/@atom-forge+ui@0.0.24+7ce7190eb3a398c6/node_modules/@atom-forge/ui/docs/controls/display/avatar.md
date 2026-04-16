# Avatar

A circular user representation component. Renders an image when `src` is provided, otherwise falls back to initials with a deterministic color generated from the name string.

## Import

```sveltehtml
import { Avatar } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Full name for initials and color generation. |
| `src` | `string` | — | Image URL. Renders `<img>` instead of initials. |
| `color` | `string` | — | Override the auto-generated color class. |
| `tooltip` | `boolean` | `false` | Shows the full name in a tooltip on hover. Requires `name`. |
| `compact` | `boolean` | `false` | h-8 w-8, text-xs. |
| `small` | `boolean` | `false` | h-6 w-6, text-[10px]. |
| `micro` | `boolean` | `false` | h-5 w-5, text-[9px]. For dense UI. |
| `class` | `string` | — | Extra Tailwind classes, merged via `twMerge`. |

Default size (no size prop): h-10 w-10, text-sm.

---

## Color generation

When no `src` is provided, the background/text color is derived from the `name` via a simple hash function. This ensures the same name always maps to the same color across renders and page loads. Provide `color` to override with any Tailwind class string.

---

## Tooltip

Set `tooltip` to show the full name on hover. Works with both initials and image avatars. Requires `name` to be set — if `name` is absent the tooltip is not rendered.

---

## Usage

```sveltehtml
<!-- Initials from name (auto-color) -->
<Avatar name="Alice Johnson"/>

<!-- Image -->
<Avatar src="/avatars/alice.jpg" name="Alice Johnson"/>

<!-- Sizes -->
<Avatar name="Alice Johnson" compact/>
<Avatar name="Alice Johnson" small/>
<Avatar name="Alice Johnson" micro/>

<!-- Custom color -->
<Avatar name="Bob" color="bg-red-500/20 text-red-600"/>

<!-- Tooltip — shows full name on hover -->
<Avatar name="Alice Johnson" tooltip/>
<Avatar src="/avatars/alice.jpg" name="Alice Johnson" tooltip/>
```
