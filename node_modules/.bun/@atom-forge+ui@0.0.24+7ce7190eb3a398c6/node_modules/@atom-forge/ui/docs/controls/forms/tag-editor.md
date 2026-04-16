# Tag Editor

An interactive input that manages a list of string tags. Type and press `Enter` to add a tag; remove them with the `×` button or `Backspace`. Supports static and async autocomplete suggestions, drag-and-drop reordering, and custom renderers.

## Import

```ts
import {TagEditor} from '$lib';
```

## Basic usage

```sveltehtml
<script lang="ts">
  let tags = $state(['svelte', 'typescript']);
</script>

<TagEditor bind:value={tags} placeholder="Add tag…" />
```

## Props

| Prop          | Type       | Default         | Description                                                             |
|---------------|------------|-----------------|-------------------------------------------------------------------------|
| `value`       | `string[]` | `[]`            | Bindable list of tags.                                                  |
| `placeholder` | `string`   | `'Add tags...'` | Shown when no tags are present.                                         |
| `disabled`    | `boolean`  | `false`         | Disables all interaction.                                               |
| `clearable`   | `boolean`  | `false`         | Shows a clear-all button when tags are present.                         |
| `allowNew`    | `boolean`  | `true`          | When `false`, only values from `options` can be added.                  |
| `sortable`    | `boolean`  | `false`         | Enables drag-and-drop reordering.                                       |
| `uppercase`   | `boolean`  | —               | Normalizes every tag to uppercase. Mutually exclusive with `lowercase`. |
| `lowercase`   | `boolean`  | —               | Normalizes every tag to lowercase. Mutually exclusive with `uppercase`. |
| `compact`     | `boolean`  | —               | Compact size. Mutually exclusive with `small`.                          |
| `small`       | `boolean`  | —               | Small size. Mutually exclusive with `compact`.                          |
| `class`       | `string`   | —               | Extra classes forwarded to the wrapper element.                         |

## Options

| Prop      | Type                                                 | Default | Description                                                                                                   |
|-----------|------------------------------------------------------|---------|---------------------------------------------------------------------------------------------------------------|
| `options` | `string[] \| ((query: string) => Promise<string[]>)` | —       | Static list or async function. Static arrays are filtered client-side; async results are debounced at 200 ms. |

When `allowNew` is `true` (default), a **"Add '…'"** entry appears at the top of the dropdown for new values. Set `allowNew={false}` to restrict to listed values only.

## Snippets

### `chip` — custom chip renderer

```sveltehtml
{#snippet chip(tag, remove)}
  <span>{tag} <button onclick={remove}>×</button></span>
{/snippet}
```

Receives `(tag: string, remove: () => void)`.

### `option` — custom dropdown item renderer

```sveltehtml
{#snippet option(item, isHighlighted)}
  <div class={isHighlighted ? 'bg-accent' : ''}>
    {item}
  </div>
{/snippet}
```

Receives `(item: string, isHighlighted: boolean)`.

## Keyboard

| Key              | Action                                                           |
|------------------|------------------------------------------------------------------|
| `Enter`          | Confirm current input as a tag, or select the highlighted option |
| `ArrowDown / Up` | Navigate the options dropdown                                    |
| `Escape`         | Close the options dropdown                                       |
| `Backspace`      | Remove the last tag (when input is empty)                        |

## Notes

- Tags are normalized (trimmed, and optionally uppercased/lowercased) before being added.
- The dropdown uses `onmousedown` so clicking a suggestion does not cause the input to lose focus before the tag is added.
- When `sortable` is enabled, the `value` binding is kept in sync with the drag order.
