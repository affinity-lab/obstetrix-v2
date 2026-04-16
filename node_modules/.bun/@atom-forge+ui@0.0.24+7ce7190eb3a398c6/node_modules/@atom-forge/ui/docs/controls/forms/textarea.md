# Textarea

A multi-line text input styled consistently with `Input`. Features autogrow, character/word counter, dirty tracking, smart Tab indentation, and a programmatic API for text manipulation via `bind:this`.

## Import

```sveltehtml
import { Textarea } from '@atom-forge/ui';
import type { TextareaAPI } from '@atom-forge/ui';
```

---

## Props

| Prop | Group | Type | Default | Description |
|------|-------|------|---------|-------------|
| `value` | Core | `string` | `''` | Bindable text content. |
| `dirty` | Core | `boolean` | `false` | Bindable. `true` if the value has changed from initial. |
| `placeholder` | Core | `string` | — | Placeholder text. |
| `disabled` | Core | `boolean` | `false` | Disables the textarea. |
| `invalid` | Core | `boolean` | `false` | Shows a destructive red border. |
| `rows` | Sizing | `number` | `3` | Minimum number of visible rows. |
| `maxRows` | Sizing | `number` | — | Maximum rows for autogrow. |
| `resizable` | Sizing | `boolean` | `false` | Enables the native resize handle. |
| `compact` | Sizing | `boolean` | — | Compact size. Mutually exclusive with `small`. |
| `small` | Sizing | `boolean` | — | Small size. Mutually exclusive with `compact`. |
| `maxLength` | Functional | `number` | — | Maximum allowed characters. |
| `showCounter` | Functional | `boolean` | `false` | Shows a character counter in the bottom-right corner. |
| `monospace` | Functional | `boolean` | `false` | Uses `font-mono`. |
| `handleTab` | Functional | `boolean` | `false` | Smart Tab / Shift+Tab indent handling. |
| `tabSize` | Functional | `number` | `2` | Indent size in spaces. `0` = literal tab character. |
| `toolbar` | Snippets | `Snippet` | — | Rendered above the textarea in a toolbar strip. |
| `adornment` | Snippets | `Snippet` | — | Bottom-right corner content. Overrides `showCounter`. |
| `counter` | Snippets | `Snippet<[{count, max, words, letters}]>` | — | Custom counter snippet. |

---

## TextareaAPI (bind:this)

```ts
interface TextareaAPI {
  // Wraps the current selection.
  // wrap: a single string used as both prefix and suffix, or [prefix, suffix] for asymmetric markers.
  // unwrapWhenWrapped: if true and the selection (or surrounding characters) already have the markers, removes them instead.
  wrapSelection(wrap: string | [string, string], unwrapWhenWrapped?: boolean): void;

  // Inserts text at the current cursor position.
  insertAtCursor(text: string): void;

  // Selects all text.
  selectAll(): void;
}
```

---

## Usage

### Basic with autogrow and counter

```sveltehtml
<Field label="Biography">
  <Textarea bind:value={bio} rows={3} maxRows={8} showCounter maxLength={200}/>
</Field>
```

### Code editor

```sveltehtml
<Textarea bind:value={code} bind:dirty monospace handleTab tabSize={2} rows={5}/>
```

### Toolbar with bind:this API

```sveltehtml
<script>
  let text = $state('');
  let api: TextareaAPI;
</script>

<Textarea bind:value={text} bind:this={api} rows={6} {toolbar}/>

{#snippet toolbar()}
  <ButtonBar>
    <!-- symmetric: **text** — toggle on/off -->
    <Button compact ghost icon={IconBold}   onclick={() => api.wrapSelection('**', true)}/>
    <Button compact ghost icon={IconItalic} onclick={() => api.wrapSelection('*', true)}/>
    <Button compact ghost icon={IconCode}   onclick={() => api.wrapSelection('`', true)}/>
    <!-- asymmetric: <mark>text</mark> -->
    <Button compact ghost label="mark" onclick={() => api.wrapSelection(['<mark>', '</mark>'], true)}/>
  </ButtonBar>
{/snippet}
```

### Custom counter snippet

```sveltehtml
<Textarea bind:value showCounter>
  {#snippet counter({ count, max, words })}
    <span class="text-xs text-muted-c">{words} words · {count}/{max}</span>
  {/snippet}
</Textarea>
```

