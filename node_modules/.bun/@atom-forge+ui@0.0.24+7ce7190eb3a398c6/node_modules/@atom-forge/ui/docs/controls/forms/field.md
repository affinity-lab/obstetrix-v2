# Field

A wrapper that pairs a form control with a label, hint, and error message. Use `FieldGroup` to align multiple horizontal fields into a two-column grid, and `FieldSpan` to let any element span the full width.

## Import

```sveltehtml
import { Field, FieldGroup, FieldSpan } from '@atom-forge/ui';
```

---

## Field Props

| Prop           | Group    | Type                         | Default      | Description                                                                                         |
|----------------|----------|------------------------------|--------------|-----------------------------------------------------------------------------------------------------|
| `label`        | Content  | `string`                     | —            | Label text above (or beside) the control.                                                           |
| `hint`         | Content  | `string`                     | —            | Helper text shown below the control.                                                                |
| `error`        | Content  | `string`                     | —            | Error message shown below the control. Takes precedence over `hint`.                                |
| `required`     | Content  | `boolean`                    | `false`      | Appends a red `*` to the label.                                                                     |
| `optional`     | Content  | `boolean`                    | `false`      | Appends an `(optional)` badge to the label.                                                         |
| `for`          | Content  | `string`                     | —            | Passed to the `<label for="...">` attribute for a11y.                                               |
| `layout`       | Layout   | `'vertical' \| 'horizontal'` | `'vertical'` | Vertical stacks label above control. Horizontal renders two grid cells for use inside `FieldGroup`. |
| `labelSnippet` | Snippets | `Snippet`                    | —            | Overrides `label`. Use for rich label content (icons, badges, etc.).                                |
| `hintSnippet`  | Snippets | `Snippet`                    | —            | Overrides `hint`.                                                                                   |
| `errorSnippet` | Snippets | `Snippet`                    | —            | Overrides `error`.                                                                                  |
| `action`       | Snippets | `Snippet`                    | —            | Rendered right-aligned in the label row (e.g. a "Forgot?" link).                                    |
| `class`        | Styling  | `string`                     | —            | Extra Tailwind classes on the wrapper element.                                                      |

---

## FieldGroup Props

| Prop         | Type     | Default  | Description                                                                              |
|--------------|----------|----------|------------------------------------------------------------------------------------------|
| `labelWidth` | `string` | `'auto'` | Width of the label column. Any CSS value: `"150px"`, `"30%"`. Defaults to `max-content`. |
| `class`      | `string` | —        | Extra Tailwind classes on the grid container.                                            |

---

## FieldSpan

No props. Wraps any content in a `col-span-2` div so it stretches across both columns inside a `FieldGroup` (e.g. a `<hr>`, a section heading, or a full-width button row).

---

## Usage

### Basic (vertical)

```sveltehtml
<Field label="Email address" hint="We'll never share your email." required>
  <Input bind:value={email} placeholder="you@example.com"/>
</Field>

<Field label="Full name" optional>
  <Input bind:value={name}/>
</Field>

<Field label="Accept terms" error={!agreed ? 'You must accept the terms.' : undefined}>
  <Switch bind:value={agreed} label="I agree to the terms and conditions"/>
</Field>
```

### Horizontal layout with FieldGroup

```sveltehtml
<FieldGroup labelWidth="120px">
  <Field label="First name" layout="horizontal" required>
    <Input bind:value={first}/>
  </Field>

  <Field label="Last name" layout="horizontal">
    <Input bind:value={last}/>
  </Field>

  <FieldSpan>
    <hr class="border-base-b"/>
  </FieldSpan>

  <Field label="Agree" layout="horizontal">
    <Switch bind:value={agreed} label="I accept the terms"/>
  </Field>
</FieldGroup>
```

### Snippet overrides

```sveltehtml
<Field required {labelSnippet} {action} {errorSnippet}>
  <Input bind:value={password} type="password"/>
</Field>

{#snippet labelSnippet()}
  <span class="flex items-center gap-1.5 text-sm font-medium">
    <IconLock size={14}/> Password
  </span>
{/snippet}

{#snippet action()}
  <a href="/forgot" class="text-xs text-accent hover:underline">Forgot?</a>
{/snippet}

{#snippet errorSnippet()}
  {#if weak}Password is too short.{/if}
{/snippet}
```

---

## Notes

- `error` takes precedence over `hint` — if both are set, only the error is shown.
- In `layout="horizontal"`, `Field` renders two grid children (label cell + control cell) that slot into a `FieldGroup`'s two-column grid.
- `FieldSpan` is only meaningful inside a `FieldGroup`.

