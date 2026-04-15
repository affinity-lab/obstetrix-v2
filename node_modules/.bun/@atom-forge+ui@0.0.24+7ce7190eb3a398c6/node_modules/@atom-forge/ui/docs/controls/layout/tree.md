# Tree

A collapsible tree view for hierarchical data. Supports node selection, custom row rendering, and click callbacks.

## Import

```sveltehtml
import { TreeView, type TreeNode } from '@atom-forge/ui';
```

---

## TreeView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeNode[]` | — | Root-level nodes. |
| `selectedId` | `string` | — | ID of the currently selected node (highlighted). |
| `onNodeClick` | `(node: TreeNode) => void` | — | Called when any node is clicked. |
| `row` | `Snippet<[TreeNode]>` | — | Custom row renderer. Overrides the default icon + label layout. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper. |

---

## TreeNode type

```ts
type TreeNode = {
  id: string;
  label: string;
  icon?: IconDefinition;
  children?: TreeNode[];
  [key: string]: any;  // Arbitrary extra data
};
```

---

## Usage

### Basic

```sveltehtml
<script>
  import { TreeView, type TreeNode } from '@atom-forge/ui';

  const data: TreeNode[] = [
    {
      id: 'src',
      label: 'src',
      children: [
        { id: 'components', label: 'components', children: [
          { id: 'Button', label: 'Button.svelte' },
        ]},
        { id: 'routes', label: 'routes' },
      ]
    },
    { id: 'package', label: 'package.json' },
  ];

  let selected = $state<string>();
</script>

<TreeView
  {data}
  selectedId={selected}
  onNodeClick={(node) => selected = node.id}
/>
```

### Custom row

```sveltehtml
{#snippet customRow(node)}
  <div class="flex items-center gap-2">
    <Icon icon={node.icon ?? IconFile} size="4" class="text-muted-c"/>
    <span class="truncate">{node.label}</span>
    {#if node.modified}
      <span class="ml-auto text-xs text-accent">M</span>
    {/if}
  </div>
{/snippet}

<TreeView {data} row={customRow} onNodeClick={...}/>
```

---

## Behavior

- Nodes with `children` show a chevron — click to expand/collapse.
- Leaf nodes (no children) show a small dot indicator.
- Expanded state is managed internally via a `Set<string>` of node IDs.
- Indentation increases by `1.25rem` per level.
- A subtle vertical guide line connects children to their parent.
