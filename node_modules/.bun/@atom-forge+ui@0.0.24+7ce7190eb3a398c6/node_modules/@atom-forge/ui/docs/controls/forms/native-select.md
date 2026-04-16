# NativeSelect

A styled wrapper around the native `<select>` element. Supports the same size variants as other form controls and an optional borderless mode.

## Import

```sveltehtml
import { NativeSelect } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `{ value: any; label: string }[]` | — | List of options to render. |
| `value` | `any` | — | Bindable selected value. |
| `placeholder` | `string` | `'Select an option'` | Placeholder option shown when nothing is selected (disabled). |
| `disabled` | `boolean` | — | Disables the select. |
| `borderless` | `boolean` | — | Removes border and makes background transparent. |
| `compact` | `boolean` | — | Compact size (h-8, text-xs). Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size (h-6, text-xs). Mutually exclusive with `compact`. |

---

## Sizes

| Size | Height | Font |
|------|--------|------|
| normal | `h-10` | `text-sm` |
| `compact` | `h-8` | `text-xs` |
| `small` | `h-6` | `text-xs` |

---

## Usage

```sveltehtml
<script>
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ];
  let selected = $state();
</script>

<NativeSelect {options} bind:value={selected}/>
<NativeSelect {options} bind:value={selected} compact/>
<NativeSelect {options} bind:value={selected} placeholder="Choose one..."/>
<NativeSelect {options} bind:value={selected} borderless/>
<NativeSelect {options} bind:value={selected} disabled/>
```
