# Radio

A radio button group built from `RadioGroup` (the context provider) and `RadioButtonView` (individual options). Size is set on `RadioGroup` and inherited by all children.

## Import

```sveltehtml
import { RadioGroup, RadioButtonView } from '@atom-forge/ui';
```

---

## RadioGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | — | Bindable currently-selected value. |
| `size` | `'normal' \| 'compact' \| 'small'` | `'normal'` | Size passed down to all `RadioButtonView` children via context. |
| `primary` | `boolean` | — | Primary color variant. Mutually exclusive with `accent`. |
| `accent` | `boolean` | — | Accent color variant. Mutually exclusive with `primary`. |
| `class` | `string` | — | Extra classes on the wrapper div. |

---

## RadioButtonView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `any` | — | The value this option represents. |
| `label` | `string` | — | Text label shown next to the button. |
| `disabled` | `boolean` | — | Disables this option. |
| `class` | `string` | — | Extra classes. |

Size is inherited from the parent `RadioGroup` context but can be overridden per-item with `compact` / `small` props directly on `RadioButtonView`. The color variant (`primary` / `accent` / default) is always set on `RadioGroup` and applies to all children.

---

## Usage

```sveltehtml
<script>
  let role = $state('user');
</script>

<RadioGroup bind:value={role} class="flex flex-col gap-2">
  <RadioButtonView value="admin" label="Admin"/>
  <RadioButtonView value="user" label="User"/>
  <RadioButtonView value="guest" label="Guest" disabled/>
</RadioGroup>

<!-- Compact horizontal group -->
<RadioGroup bind:value={role} size="compact" class="flex flex-row gap-4">
  <RadioButtonView value="admin" label="Admin"/>
  <RadioButtonView value="user" label="User"/>
</RadioGroup>

<!-- Primary variant -->
<RadioGroup bind:value={role} primary class="flex flex-col gap-2">
  <RadioButtonView value="admin" label="Admin"/>
  <RadioButtonView value="user" label="User"/>
</RadioGroup>

<!-- Accent variant -->
<RadioGroup bind:value={role} accent class="flex flex-col gap-2">
  <RadioButtonView value="admin" label="Admin"/>
  <RadioButtonView value="user" label="User"/>
</RadioGroup>
```
