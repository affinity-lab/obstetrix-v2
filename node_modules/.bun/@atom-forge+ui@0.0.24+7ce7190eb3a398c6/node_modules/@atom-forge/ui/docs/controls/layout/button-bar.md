# ButtonBar

A pure visual wrapper that groups its children into a unified bar. Borders, rounded corners, and shadows are automatically stripped from all direct children via scoped CSS. Size is controlled on the children themselves.

## Import

```sveltehtml
import { ButtonBar, ButtonBarItem } from '@atom-forge/ui';
```

---

## Components

| Component | Description |
|-----------|-------------|
| `ButtonBar` | The wrapper element. Renders as `inline-flex` by default. |
| `ButtonBarItem` | Normalizing wrapper for components that aren't naturally compatible (Switch, Slider, ColorPicker, etc.). |

---

## ButtonBar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Direct children — Buttons, Inputs, or any styled element. |
| `class` | `string` | — | Extra Tailwind classes, merged via `twMerge`. |

---

## ButtonBarItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `Snippet` | — | Component to wrap. |
| `class` | `string` | — | Extra Tailwind classes. |

`ButtonBarItem` applies `self-stretch` so it fills the bar's full height, and adds `bg-control px-2` for a consistent visual container.

---

## Usage

### Buttons

```sveltehtml
<ButtonBar>
  <Button label="One"/>
  <Button label="Two"/>
  <Button label="Three"/>
</ButtonBar>
```

### Full-width with equal-width buttons

Add `class="flex w-full"` to the bar and `class="flex-1"` to each child.

```sveltehtml
<ButtonBar class="flex w-full">
  <Button class="flex-1" label="One"/>
  <Button class="flex-1" label="Two"/>
  <Button class="flex-1" label="Three"/>
</ButtonBar>
```

### Mixed components (Input + Button)

Components with a styled outer element work directly as children — their border and rounding are stripped automatically.

```sveltehtml
<ButtonBar class="flex w-full">
  <Input class="flex-1" bind:value={query} placeholder="Search..."/>
  <Button label="Search" icon={IconSearch}/>
</ButtonBar>
```

### ButtonBarItem — for non-compatible components

Wrap components without a standard control surface (Switch, Slider, ColorPicker…) to give them a matching background and stretch them to bar height.

```sveltehtml
<ButtonBar>
  <ButtonBarItem>
    <Switch bind:value={enabled}/>
  </ButtonBarItem>
  <ButtonBarItem>
    <Slider bind:value={volume} class="w-32"/>
  </ButtonBarItem>
  <Button icon={IconSettings}/>
</ButtonBar>
```

---

## How CSS stripping works

A scoped `<style>` block applies to all direct children:

```css
span > :global(*) {
  border-radius: 0 !important;
  border-width: 0 !important;
  box-shadow: none !important;
}
```

This reliably overrides any component's own styles without relying on Tailwind arbitrary selectors.
