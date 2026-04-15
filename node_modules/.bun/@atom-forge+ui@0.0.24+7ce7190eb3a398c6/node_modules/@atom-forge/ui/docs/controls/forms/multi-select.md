# MultiSelect

Select multiple items from a list. Stores the `value` field of each selected option and displays the human-readable `label` as chips. Supports static arrays and async search functions.

## Import

```ts
import { MultiSelect } from '$lib';
import type { SelectOption, SelectOptionsSource } from '$lib';
```

## Basic usage

```sveltehtml
<script lang="ts">
  import { MultiSelect } from '$lib';

  const options = [
    { value: 'hu', label: 'Hungary' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  let value = $state<string[]>([]);
</script>

<MultiSelect {options} bind:value placeholder="Select countries..." />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `(string \| number)[]` | `[]` | Selected values. Use `bind:value` for two-way binding. |
| `options` | `SelectOptionsSource` | — | Static array or async source object with `search` and `get` methods. |
| `placeholder` | `string` | `'Select...'` | Placeholder shown when nothing is selected. |
| `disabled` | `boolean` | `false` | Disables the trigger. Chips remain visible. |
| `searchable` | `boolean` | `true` | Shows a search input in the dropdown. |
| `clearable` | `boolean` | `false` | Shows a clear-all button when items are selected. |
| `sortable` | `boolean` | `false` | Enables drag-and-drop chip reordering. |
| `max` | `number` | — | Maximum selectable items. Further options are greyed out. |
| `compact` | `boolean` | — | Compact size. Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size. Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra classes forwarded to the trigger element. |

## Snippets

### `chip` — custom chip renderer

```sveltehtml
{#snippet chip(opt, remove)}
  <span>{opt.label} <button onclick={remove}>×</button></span>
{/snippet}
```

Receives `(opt: SelectOption, remove: () => void)`.

### `option` — custom dropdown item renderer

```sveltehtml
{#snippet option(opt, isHighlighted)}
  <div class={isHighlighted ? 'bg-accent' : ''}>
    {opt.label}
  </div>
{/snippet}
```

Receives `(opt: SelectOption, isHighlighted: boolean)`.

## Async options

Pass an object with `search` and `get` methods as `options`.
`search(query)` fetches results on demand.
`get(values)` resolves pre-selected values on mount so their labels remain visible.

```sveltehtml
<script lang="ts">
  import { MultiSelect, type SelectOption } from '$lib';

  const source = {
    search: async (query: string): Promise<SelectOption[]> => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
      return res.json();
    },
    get: async (values: (string | number)[]): Promise<SelectOption[]> => {
      const res = await fetch(`/api/users?ids=${values.join(',')}`);
      return res.json();
    },
  };

  let selected = $state<string[]>([]);
</script>

<MultiSelect options={source} bind:value={selected} placeholder="Search users…" />
```

## Sortable chips

Add `sortable` to enable drag-and-drop reordering. The `value` binding is kept in sync with the displayed order.

```sveltehtml
<MultiSelect {options} bind:value sortable />
```

## Keyboard

| Key | Action |
|-----|--------|
| `ArrowDown / Up` | Navigate the dropdown list |
| `Enter` | Toggle the highlighted option |
| `Escape` | Close the dropdown |

## SelectOption type

```ts
type SelectOption = {
  value: string | number;
  label: any;
};
```
