# Badge

An absolute-positioned overlay indicator for notification counts or status dots. Wraps any element and renders a small indicator in the top-right corner.

## Import

```sveltehtml
import { Badge } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | The element the badge is overlaid on. |
| `count` | `number` | — | Number displayed. Badge hides automatically when `count` is 0. |
| `dot` | `boolean` | `false` | Show a dot instead of a number. |
| `max` | `number` | `99` | Maximum number shown. Displays `N+` when exceeded. |
| `color` | `'accent' \| 'red' \| 'green' \| 'blue'` | `'accent'` | Badge color. |
| `hidden` | `boolean` | `false` | Force-hides the badge. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper `div`. |

---

## Usage

```sveltehtml
<!-- Count badge -->
<Badge count={3}>
  <Button icon={defineIcon(IconBell)} ghost/>
</Badge>

<!-- Dot badge -->
<Badge dot color="red">
  <Button icon={defineIcon(IconMail)} ghost/>
</Badge>

<!-- Overflow -->
<Badge count={142} max={99} color="red">
  <Button icon={defineIcon(IconBell)} ghost/>
</Badge>

<!-- Hidden -->
<Badge count={5} hidden>
  <Button ghost label="No badge"/>
</Badge>
```
