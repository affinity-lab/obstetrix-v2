# Checkbox

Boolean toggle control with optional group management and three color variants.

---

## Components

| Component | Description |
|-----------|-------------|
| `Checkbox` | Full stateful checkbox — handles value binding, group registration, and click logic. |
| `CheckboxView` | Stateless render-only component. No internal logic; you control `status` and `onclick`. |
| `CheckboxGroupManager` | Context provider component — wrap checkboxes to enable group functionality. |
| `createCheckboxGroupManager()` | Creates a group manager in the current component's context without a wrapper element. |

---

## Checkbox Props

| Prop | Type | Group | Default | Description |
|------|------|-------|---------|-------------|
| `value` | `boolean` | Value | `false` | Bindable checked state. Mutually exclusive with `checked`. |
| `checked` | `boolean` | Value | — | Alternative bindable for checked state. Mutually exclusive with `value`. |
| `onchange` | `(checked: boolean) => void` | — | — | Fired whenever the checked state changes. |
| `label` | `string` | — | `''` | Text displayed next to the checkbox. |
| `disabled` | `boolean` | — | `false` | Prevents interaction; applies faded appearance. |
| `primary` | `boolean` | Color | — | Checked state uses the primary color. |
| `accent` | `boolean` | Color | — | Checked state uses the accent color. |
| `compact` | `boolean` | Size | — | Medium size (16px box, `text-sm` label). |
| `small` | `boolean` | Size | — | Small size (14px box, `text-xs` label). |
| `group` | `string` | — | — | Group name. Requires a `CheckboxGroupManager` in context. |
| `master` | `boolean` | — | `false` | When `group` is set — toggles all group members; shows indeterminate when only some are checked. |

---

## CheckboxView Props

| Prop | Type | Group | Default | Description |
|------|------|-------|---------|-------------|
| `status` | `'checked' \| 'some' \| 'unchecked'` | — | `'unchecked'` | Visual state. `'some'` renders a minus icon (indeterminate). |
| `label` | `string` | — | `''` | Text displayed next to the checkbox. |
| `disabled` | `boolean` | — | `false` | Faded, non-interactive appearance. |
| `primary` | `boolean` | Color | — | Active state uses the primary color. |
| `accent` | `boolean` | Color | — | Active state uses the accent color. |
| `compact` | `boolean` | Size | — | Medium size. |
| `small` | `boolean` | Size | — | Small size. |
| `onclick` | `(event: MouseEvent) => void` | — | — | Click handler — state management is entirely your responsibility. |

---

## Color Variants

Three variants for the checked/active state. At most one applies; they are mutually exclusive (`XOR`).

| Variant | Box color | Hover |
|---------|-----------|-------|
| *(default)* | `bg-control-v border-base-b text-control-c` | `hover:bg-secondary` |
| `primary` | `bg-primary border-primary text-primary-c` | `hover:bg-primary/10` |
| `accent` | `bg-accent border-accent text-accent-c` | `hover:bg-accent/10` |

Unchecked state is always `bg-control border-base-b` regardless of variant.

```sveltehtml
<Checkbox label="Default"  value={true} />
<Checkbox label="Primary"  value={true} primary />
<Checkbox label="Accent"   value={true} accent />

<!-- checked as alternative binding -->
<Checkbox label="Default" bind:checked={isOn} />

<!-- with onchange -->
<Checkbox label="Notify me" bind:value={enabled} onchange={(v) => console.log('changed:', v)} />
```

---

## Sizes

Three sizes, mutually exclusive.

| Size | Box | Label font |
|------|-----|-----------|
| *(normal)* | `w-5 h-5` (20px) | inherited |
| `compact` | `w-4 h-4` (16px) | `text-sm` |
| `small` | `w-3.5 h-3.5` (14px) | `text-xs` |

> **Note:** Do not use `text-base` for normal label size — since `--color-base` is a defined CSS variable, Tailwind v4 interprets it as a color class, not a font-size class.

---

## Group Management

Grouped checkboxes share state through a `CheckboxGroupManager`. All checkboxes in the same group must share the same `group` string and have access to the same manager context.

### Option 1 — Wrapper component

```sveltehtml
<CheckboxGroupManager>
  <Checkbox group="items" label="Select All" master />
  <hr />
  <Checkbox group="items" label="Option A" value={false} />
  <Checkbox group="items" label="Option B" value={true} />
  <Checkbox group="items" label="Option C" value={true} />
</CheckboxGroupManager>
```

### Option 2 — Programmatic (scattered layout)

Call `createCheckboxGroupManager()` in the script block of the nearest common ancestor. The checkboxes do not need to be direct children.

```sveltehtml
<script>
  import { createCheckboxGroupManager, Checkbox } from '@atom-forge/ui';
  createCheckboxGroupManager();
</script>

<!-- checkboxes can be anywhere in the subtree -->
<Checkbox group="items" label="Select All" master />
<Checkbox group="items" label="Option A" value={false} />
```

### Master checkbox behavior

| Group state | Master displays |
|-------------|----------------|
| All checked | checked |
| All unchecked | unchecked |
| Mixed | indeterminate (`'some'`) |

Clicking a master when mixed or unchecked → checks all. Clicking when all checked → unchecks all.

---

## Architecture

```
Checkbox
  └── CheckboxView          (render only)

CheckboxGroupManager        (context provider component)
  └── sets CheckboxGroupManager instance in context

createCheckboxGroupManager() (function)
  └── same as above, without a wrapper element

CheckboxGroupManager (class)
  └── groups: Map<string, NamedCheckboxGroupManager>

NamedCheckboxGroupManager (class)
  ├── masters: Map<id, { changeState }>
  ├── values:  Map<id, { value, changeState }>
  ├── registerMaster / unregisterMaster
  ├── registerValue  / unregisterValue
  ├── set(id, value)         — toggle individual item
  ├── toggleAll()            — master click handler
  └── updateMasterState()    — recalculates master status after any change
```

Checkboxes register themselves in `onMount` and unregister on destroy (cleanup returned from `onMount`). The `group` prop is frozen with `untrack()` at init — changing the group name at runtime is not supported.

---

## Accessibility

`CheckboxView` renders a `<div role="checkbox">` with:
- `aria-checked` — `true` / `false` / `'mixed'` (for indeterminate)
- `aria-disabled` — set when disabled
- `tabindex="0"` — keyboard focusable (omitted when disabled)
- `onkeydown` — Space and Enter activate the checkbox
