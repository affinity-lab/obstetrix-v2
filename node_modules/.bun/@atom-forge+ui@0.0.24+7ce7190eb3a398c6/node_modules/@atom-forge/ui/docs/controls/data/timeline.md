# Timeline

A flexible timeline component that renders an `items` array along a vertical or horizontal line. Content and dot nodes are fully customisable via snippets.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `any[]` | required | Data array. Passed as-is to both snippets. |
| `right` | `boolean` | — | Vertical layout, content on the right (default when no direction is set). |
| `left` | `boolean` | — | Vertical layout, content on the left. |
| `bottom` | `boolean` | — | Horizontal layout, content below. |
| `top` | `boolean` | — | Horizontal layout, content above. |
| `alternate` | `boolean` | `false` | Flips content to the opposite side on each successive item. |
| `children` | `Snippet<[any]>` | required | Renders each item's content. |
| `dot` | `Snippet<[any]>` | — | Renders the line node. Defaults to a small grey circle. |
| `class` | `string` | — | Extra classes on the connecting line element. |

Direction props (`left`, `right`, `top`, `bottom`) are mutually exclusive; provide exactly one. If none is set, `right` behaviour is used.

## Layouts

| Layout | Structure |
|--------|-----------|
| `right` | Vertical line on the left, all content to the right |
| `left` | Vertical line on the right, all content to the left |
| `right` + `alternate` | 3-column grid, content alternates right/left |
| `bottom` | Horizontal line at top of section, all content below |
| `top` | Horizontal line at bottom, all content above |
| `bottom` + `alternate` | Content alternates below/above the dot row |

## Example

```sveltehtml
<script>
  import { Timeline } from '$lib';
  import { CheckCircle, Circle } from 'lucide-svelte';

  const tasks = [
    { label: 'Design', done: true },
    { label: 'Build', done: true },
    { label: 'Test', done: false },
  ];
</script>

<Timeline items={tasks} right>
  {#snippet dot(t)}
    {#if t.done}
      <CheckCircle size={18} class="text-emerald-500" />
    {:else}
      <Circle size={18} class="text-muted-c" />
    {/if}
  {/snippet}

  {#snippet children(t)}
    <p class="text-sm font-medium">{t.label}</p>
  {/snippet}
</Timeline>
```
