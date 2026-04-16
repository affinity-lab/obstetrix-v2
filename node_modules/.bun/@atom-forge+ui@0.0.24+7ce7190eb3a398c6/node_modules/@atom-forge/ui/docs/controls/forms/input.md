# Input

A styled text input supporting multiple types, sizes, icons, prefix/suffix slots, and password visibility toggle.

## Import

```sveltehtml
import { Input } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Bindable input value. |
| `type` | `'text' \| 'integer' \| 'float' \| 'password'` | `'text'` | Input type. `integer` and `float` auto-strip invalid characters. |
| `placeholder` | `string` | — | Placeholder text. |
| `disabled` | `boolean` | — | Disables the input. |
| `invalid` | `boolean` | — | Applies destructive border and text color. |
| `monospace` | `boolean` | — | Uses a monospace font. |
| `icon` | `IconDefinition` | — | Icon shown at the left inside the input. |
| `prefix` | `Snippet \| string` | — | Left slot (shown with a right border separator). |
| `suffix` | `Snippet \| string` | — | Right slot (shown with a left border separator). |
| `compact` | `boolean` | — | Compact size (h-8, text-xs). Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size (h-6). Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper, merged via `twMerge`. |

---

## Sizes

| Size | Height | Font |
|------|--------|------|
| normal | `h-10` | `text-sm` |
| `compact` | `h-8` | `text-xs` |
| `small` | `h-6` | `text-[12px]` |

---

## Usage

```sveltehtml
<script>
  let name = $state('');
  let age  = $state('');
</script>

<!-- Basic -->
<Input bind:value={name} placeholder="Full name"/>

<!-- Numeric -->
<Input bind:value={age} type="integer" placeholder="Age"/>

<!-- With icon -->
<Input bind:value={name} icon={IconSearch} placeholder="Search..."/>

<!-- Password -->
<Input bind:value={pass} type="password" placeholder="Password"/>

<!-- Prefix / suffix string -->
<Input bind:value={amount} prefix="$" suffix=".00"/>

<!-- Prefix / suffix snippet -->
<Input bind:value={url}>
  {#snippet prefix()}
    <span class="text-muted-c text-xs">https://</span>
  {/snippet}
</Input>

<!-- Invalid state -->
<Input bind:value={email} invalid placeholder="Invalid email"/>

<!-- Sizes -->
<Input bind:value={q} compact placeholder="Compact"/>
<Input bind:value={q} small placeholder="Small"/>
```

---

## ButtonBar usage

```sveltehtml
<ButtonBar class="flex w-full">
  <Input bind:value={query} class="flex-1" placeholder="Search..."/>
  <Button label="Go" icon={IconSearch}/>
</ButtonBar>
```
