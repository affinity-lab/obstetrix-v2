# Pagination Slider

A slider-based pagination control. The user drags the thumb or clicks prev/next to navigate pages. Best suited for large datasets where scrubbing through pages is more natural than clicking numbered buttons.

The component handles internal state and debounced output — the bound `page` only updates ~150ms after the user stops dragging, while the slider position itself is always smooth.

## Import

```sveltehtml
import { PaginationSlider } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | `1` | Current page (1-indexed). Use `bind:page` for two-way binding. |
| `total` | `number` | — | Total item count. |
| `pageSize` | `number` | — | Items per page. Total pages = `⌈total / pageSize⌉`. |
| `compact` | `boolean` | — | Compact size. Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size. Mutually exclusive with `compact`. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper. |

---

## Usage

```sveltehtml
<script>
  let page = $state(1);
  const total    = 500;
  const pageSize = 25;

  const totalPages = $derived(Math.ceil(total / pageSize));
  const start      = $derived((page - 1) * pageSize + 1);
  const end        = $derived(Math.min(page * pageSize, total));
</script>

<PaginationSlider bind:page {total} {pageSize}/>
<p>{page}/{totalPages} · {start}–{end} of {total}</p>

<!-- Compact -->
<PaginationSlider bind:page {total} {pageSize} compact/>
```

### Notes

- The readout (e.g. `3/20 · 51–75 of 500`) is intentionally **not** built into the component — derive and render it yourself to match your layout.
- Resetting `page` from outside (e.g. on filter/folder change) is reflected immediately in the slider.
