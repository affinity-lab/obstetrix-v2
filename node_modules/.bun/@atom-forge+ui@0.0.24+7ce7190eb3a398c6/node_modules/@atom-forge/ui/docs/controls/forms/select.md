# Select

A popup-based dropdown select. Accepts a static options array or an async search function. Supports custom rendering via snippets for both the trigger display and dropdown items.

## Import

```sveltehtml
import { Select } from '@atom-forge/ui';
import type { SelectOption, SelectOptionsSource } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| number` | — | Bindable selected value. |
| `options` | `SelectOptionsSource` | `[]` | Static array or async source object with `search` and `get` methods. |
| `placeholder` | `string` | `'Select...'` | Text shown when no value is selected. |
| `disabled` | `boolean` | `false` | Disables the trigger button. |
| `searchable` | `boolean` | `true` | Shows a search input inside the dropdown. |
| `clearable` | `boolean` | `false` | Shows an × button to clear the value. Selecting the same item again also clears it. |
| `compact` | `boolean` | — | Compact size (h-8). Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size (h-6). Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra CSS classes on the trigger button. |
| `trigger` | `Snippet<[SelectOption]>` | — | Custom rendering of the selected value in the trigger button. |
| `option` | `Snippet<[SelectOption, boolean]>` | — | Custom rendering of each dropdown item. Receives `(option, isHighlighted)`. |

---

## Types

```ts
type SelectOption = { value: string | number; label: any };

type SelectOptionsSource =
  | SelectOption[]
  | {
      search: (query: string) => Promise<SelectOption[]>;
      get: (values: (string | number)[]) => Promise<SelectOption[]>;
    };
```

---

## Usage

### Static options

```sveltehtml
<script>
  import { Select } from '@atom-forge/ui';

  const options = [
    { value: 'apple',  label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  let value = $state();
</script>

<Select {options} bind:value placeholder="Pick a fruit..."/>
```

### Clearable

```sveltehtml
<Select {options} bind:value clearable/>
```

### Async search

Pass an object with `search` and `get` methods as `options`.
`search(query)` is called on every query change.
`get(values)` resolves pre-selected values on load so the trigger can display the correct label.

```sveltehtml
<script>
  import { Select } from '@atom-forge/ui';

  const source = {
    search: async (q: string) => {
      const res = await fetch(`/api/items?q=${encodeURIComponent(q)}`);
      return res.json(); // SelectOption[]
    },
    get: async (values: (string | number)[]) => {
      const res = await fetch(`/api/items?ids=${values.join(',')}`);
      return res.json(); // SelectOption[]
    },
  };

  let value = $state<string | undefined>();
</script>

<Select options={source} bind:value placeholder="Search..."/>
```

### Custom rendering

Extra fields on option objects are accessible via `(opt as any).field`:

```sveltehtml
<Select {options} bind:value>
  {#snippet trigger(opt)}
    <span class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full {(opt as any).dot}"></span>
      {opt.label}
    </span>
  {/snippet}
  {#snippet option(opt, isHighlighted)}
    <div class={isHighlighted ? 'bg-accent text-accent-c' : 'hover:bg-base-b'}>
      {opt.label}
    </div>
  {/snippet}
</Select>
```

### Sizes

```sveltehtml
<Select {options} bind:value/>           <!-- normal (h-10) -->
<Select {options} bind:value compact/>   <!-- h-8 -->
<Select {options} bind:value small/>     <!-- h-6 -->
```
