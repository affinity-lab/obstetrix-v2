# Tooltip

A hover tooltip that follows the cursor and appears after a configurable delay. Rendered in a portal to avoid clipping.

## Import

```sveltehtml
import { Tooltip } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Text shown in the tooltip. Either `label` or `content` is required. |
| `content` | `Snippet` | — | Custom snippet rendered inside the tooltip. Takes precedence over `label`. |
| `children` | `Snippet` | — | The element to attach the tooltip to. |
| `delay` | `number` | `1000` | Delay in ms before the tooltip appears after hover. |
| `immediate` | `boolean` | `false` | Shorthand for `delay={0}` — tooltip appears instantly on hover. |
| `inverted` | `boolean` | `false` | Inverted style: dark background with light text. |
| `fixed` | `boolean` | `false` | Anchors the tooltip to the trigger element instead of following the cursor. |
| `class` | `string` | — | Extra Tailwind classes on the trigger wrapper (`inline-block`). |

---

## Behavior

- Tooltip appears after `delay` ms once the cursor enters the trigger area.
- Disappears immediately on mouse leave.
- Position is calculated from cursor coordinates and flips to stay within the viewport.
- With `fixed`, position is calculated from the trigger element's bounding rect and does not update on mouse move.
- Rendered via a `portal` action into `#atom-forge-portal-target` to avoid clipping by overflow containers.

---

## Usage

```sveltehtml
<!-- Basic -->
<Tooltip label="Save document">
  <Button icon={IconSave}/>
</Tooltip>

<!-- Inverted style -->
<Tooltip label="Dark tooltip" inverted>
  <Button label="Hover me"/>
</Tooltip>

<!-- Rich content via snippet -->
<Tooltip>
  {#snippet content()}
    <div class="flex flex-col gap-1">
      <p class="font-semibold">Alice Johnson</p>
      <p class="text-muted-c">alice@example.com</p>
    </div>
  {/snippet}
  <Button label="Rich tooltip"/>
</Tooltip>

<!-- Custom delay -->
<Tooltip label="This field is required" delay={300}>
  <Input bind:value={name} invalid placeholder="Name"/>
</Tooltip>

<!-- Instant tooltip -->
<Tooltip label="Copy to clipboard" immediate>
  <button>Copy</button>
</Tooltip>

<!-- Fixed — anchored to element, not cursor -->
<Tooltip label="Anchored tooltip" fixed>
  <Button label="Fixed"/>
</Tooltip>
```
