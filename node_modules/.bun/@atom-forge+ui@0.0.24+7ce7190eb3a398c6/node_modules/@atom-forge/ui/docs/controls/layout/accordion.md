# Accordion

Expandable content panels with support for single or multiple open items, different sizes, and visual styles.

---

## Components

| Component | Description |
|-----------|-------------|
| `Accordion` | Wrapper component that manages state and layout for accordion items. |
| `AccordionItem` | Individual expandable panel containing a header and content. |
| `Collapsible` | A standalone, single-item accordion that manages its own state. |

---

## Accordion Props

| Prop | Type | Group | Default | Description |
|------|------|-------|---------|-------------|
| `multiple` | `boolean` | — | `false` | Allows multiple items to be open simultaneously. |
| `compact` | `boolean` | Size | — | Medium size padding and text. |
| `small` | `boolean` | Size | — | Small size padding and text. |
| `borderless` | `boolean` | — | `false` | Removes borders from items. |
| `joined` | `boolean` | — | `false` | Renders items as a single connected list with dividers. |

---

## AccordionItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Text displayed in the header button. |
| `icon` | `IconDefinition` | — | Optional icon displayed before the title. |
| `id` | `string` | random | Unique identifier for the item. |
| `class` | `string` | — | Extra CSS classes applied to the header button. |

---

## Collapsible

A simplified wrapper around `AccordionItem` that doesn't require an `Accordion` parent. It manages its own open/closed state.

### Props

| Prop | Type | Group | Default | Description |
|------|------|-------|---------|-------------|
| `title` | `string` | — | — | Text displayed in the header button. |
| `icon` | `IconDefinition` | — | — | Optional icon displayed before the title. |
| `open` | `boolean` | — | `false` | Bindable state for open/closed status. |
| `compact` | `boolean` | Size | — | Medium size padding and text. |
| `small` | `boolean` | Size | — | Small size padding and text. |
| `borderless` | `boolean` | — | `false` | Removes borders from the item. |

### Usage

```sveltehtml
<script>
  let isOpen = $state(false);
</script>

<Collapsible title="Toggle Me" bind:open={isOpen}>
  <p>Content goes here...</p>
</Collapsible>
```

---

## Visual Styles

### Joined vs Separated

By default, accordion items are separated by space. Use `joined` to merge them into a single list.

```sveltehtml
<!-- Default (Separated) -->
<Accordion>
  <AccordionItem title="Item 1">Content 1</AccordionItem>
  <AccordionItem title="Item 2">Content 2</AccordionItem>
</Accordion>

<!-- Joined -->
<Accordion joined>
  <AccordionItem title="Item 1">Content 1</AccordionItem>
  <AccordionItem title="Item 2">Content 2</AccordionItem>
</Accordion>
```

### Borderless

Use `borderless` to remove the outer border of items. Useful when nesting or placing inside other containers.

```sveltehtml
<Accordion borderless>
  <AccordionItem title="Clean Item">Content</AccordionItem>
</Accordion>
```

---

## Sizes

Three sizes, mutually exclusive. Controls padding and font size of the header.

| Size | Padding | Label font |
|------|---------|-----------|
| *(normal)* | `p-4` | inherited |
| `compact` | `p-2` | `text-sm` |
| `small` | `p-1 px-2` | `text-xs` |

```sveltehtml
<Accordion compact>
  <AccordionItem title="Compact Item">Content</AccordionItem>
</Accordion>
```

---

## Behavior

### Single vs Multiple Expansion

By default, opening an item closes others. Use `multiple` to allow multiple items to be open at once.

```sveltehtml
<Accordion multiple>
  <AccordionItem title="Item 1">Content 1</AccordionItem>
  <AccordionItem title="Item 2">Content 2</AccordionItem>
</Accordion>
```

---

## Architecture

```
Accordion                   (context provider)
  └── createAccordionManager()
       └── AccordionManager instance

AccordionItem               (consumer)
  └── getAccordionManager()
       └── reads state (isOpen)
       └── triggers toggleItem(id)
```

The `AccordionManager` uses a `Set<string>` to track active item IDs.
- If `multiple` is false, the set contains at most one ID.
- If `multiple` is true, it can contain any number of IDs.

State is reactive using Svelte 5 `$state` runes.
