# Table

A generic, type-safe data table with sticky headers, column visibility control, custom cell rendering, and per-row/per-cell styling.

## Import

```sveltehtml
import { Table, type ColumnDef } from '@atom-forge/ui';
```

---

## Table Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | — | Row data array. `T` must extend `Record<string, any>`. |
| `columns` | `ColumnDef<T>[]` | — | Bindable column definitions. |
| `rowStyle` | `string \| StylingFn<T>` | — | Static class string or function returning classes/styles per row. |
| `columnsEditable` | `boolean` | `false` | Enables a right-click context menu on the header to toggle column visibility. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper, merged via `twMerge`. |

---

## ColumnDef

```ts
type ColumnDef<T> = {
  key: keyof T;           // Data key to read from each row
  label: string;          // Column header text
  visible?: boolean;      // Defaults to true
  fixed?: boolean;        // Prevents hiding via columnsEditable
  grow?: true;            // Column expands to fill remaining width
  shrink?: true;          // Column shrinks to fit content
  style?: ColumnStyling<T>;
  formatter?: (row: T, table: T[], index: number) => string | number;
  snippet?: Snippet<[T]>;
};
```

`formatter` and `snippet` are mutually exclusive.

---

## ColumnStyling

```ts
type ColumnStyling<T> = {
  header?: string;                          // Tailwind classes on <th>
  cell?: string | StylingFn<T>;            // Static class or function
};

type StylingFn<T> = (row: T, table: T[], index: number) => StylingResult;
type StylingResult = string | { class?: string; style?: string };
```

---

## Usage

```sveltehtml
<script>
  import { Table, type ColumnDef } from '@atom-forge/ui';

  type User = { id: number; name: string; role: string; active: boolean };

  const data: User[] = [
    { id: 1, name: 'Alice', role: 'Admin', active: true },
    { id: 2, name: 'Bob',   role: 'User',  active: false },
  ];

  let columns: ColumnDef<User>[] = [
    { key: 'id',     label: 'ID',    shrink: true },
    { key: 'name',   label: 'Name',  grow: true },
    { key: 'role',   label: 'Role',
      style: { cell: (row) => row.role === 'Admin' ? 'font-bold text-accent' : '' }
    },
    { key: 'active', label: 'Active',
      snippet: activeCellSnippet,
    },
  ];
</script>

{#snippet activeCellSnippet(row)}
  <Chip color={row.active ? 'green' : 'base'}>
    {row.active ? 'Active' : 'Inactive'}
  </Chip>
{/snippet}

<Table {data} bind:columns class="max-h-96"/>
```

### Row styling

```sveltehtml
<Table
  {data}
  bind:columns
  rowStyle={(row) => row.active ? '' : 'opacity-50'}
/>
```

### Editable columns

```sveltehtml
<Table {data} bind:columns columnsEditable/>
```

Right-click the header to show the column visibility popup.

---

## Column visibility

Set `visible: false` in a column definition to hide it initially. Set `fixed: true` to prevent the user from toggling it via the settings popup.
