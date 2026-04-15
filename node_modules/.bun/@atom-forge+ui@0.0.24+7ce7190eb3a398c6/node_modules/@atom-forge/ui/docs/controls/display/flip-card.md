# FlipCard

A 3D flip card with a front and back face. Supports hover, click, and manual trigger modes, plus an optional mouse-follow tilt and brightness effect.

## Import

```sveltehtml
import { FlipCard } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `front` | `Snippet<[() => void]>` | — | Front face content. Receives a `flip()` function. Mutually exclusive with `children`. |
| `children` | `Snippet<[() => void]>` | — | Alias for `front`. |
| `back` | `Snippet<[() => void]>` | — | Back face content. Receives a `flip()` function. |
| `flipped` | `boolean` | `false` | Bindable flip state. |
| `trigger` | `'hover' \| 'click' \| 'manual'` | `'hover'` | What triggers the flip. Use `'manual'` to control `flipped` externally. |
| `follow` | `Follow` | — | Mouse-follow tilt and brightness effect. |
| `class` | `string` | — | Extra Tailwind classes on the wrapper. |

### Follow type

```ts
type Follow = {
  tilt?: number;           // Max tilt in degrees
  brightness?: number | { day?: number; night?: number };
};
```

---

## Usage

### Hover flip

```sveltehtml
<div class="h-48 w-36">
  <FlipCard>
    {#snippet front(flip)}
      <Card class="h-full flex items-center justify-center">Front</Card>
    {/snippet}
    {#snippet back(flip)}
      <Card class="h-full flex items-center justify-center">Back</Card>
    {/snippet}
  </FlipCard>
</div>
```

### Click flip

```sveltehtml
<FlipCard trigger="click">
  {#snippet front(flip)}...{/snippet}
  {#snippet back(flip)}...{/snippet}
</FlipCard>
```

### Manual control

```sveltehtml
<script>
  let flipped = $state(false);
</script>

<FlipCard trigger="manual" bind:flipped>
  {#snippet front(flip)}
    <button onclick={() => flipped = true}>Show back</button>
  {/snippet}
  {#snippet back(flip)}
    <button onclick={() => flipped = false}>Show front</button>
  {/snippet}
</FlipCard>
```

### Mouse-follow tilt

```sveltehtml
<FlipCard follow={{ tilt: 10, brightness: { day: 0.15, night: 0.2 } }}>
  ...
</FlipCard>
```

---

## Notes

- The wrapper uses `perspective: 1000px` for the 3D effect.
- Both faces use `backface-hidden` so only the active face is visible.
- `FlipCard` fills its parent (`h-full w-full`), so always place it inside a sized container.
