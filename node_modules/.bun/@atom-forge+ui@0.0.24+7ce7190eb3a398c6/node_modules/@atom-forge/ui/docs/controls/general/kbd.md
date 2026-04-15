# Kbd

Renders keyboard shortcut keys styled as physical keycaps. Supports single keys and multi-key combinations.

## Import

```sveltehtml
import { Kbd } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keys` | `string \| string[]` | — | A single key or an array of keys. Arrays are rendered with `+` separators. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper `<span>`. |

---

## Usage

```sveltehtml
<!-- Single key -->
<Kbd keys="Enter"/>
<Kbd keys="⌘"/>
<Kbd keys="Escape"/>

<!-- Key combination -->
<Kbd keys={['⌘', 'K']}/>
<Kbd keys={['⌘', '⇧', 'Z']}/>
<Kbd keys={['Ctrl', 'Alt', 'Del']}/>
```

### Keyboard symbols reference

| Symbol | Meaning |
|--------|---------|
| `⌘` | Command (Mac) |
| `⌥` | Option/Alt (Mac) |
| `⇧` | Shift |
| `⌃` | Control |
| `⌫` | Backspace/Delete |
| `↩` | Return/Enter |
