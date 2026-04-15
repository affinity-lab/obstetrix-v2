# Stepper

A navigational component that guides users through a sequential process. Displays completed, current, and upcoming steps with connecting lines. Supports horizontal and vertical orientations.

## Props

| Prop          | Type                          | Default          | Description |
|---------------|-------------------------------|------------------|-------------|
| `steps`       | `Step[]`                      | `[]`             | Array of step objects. Each step has `id`, `label`, and an optional `description`. |
| `current`     | `string` (bindable)           | `steps[0]?.id`   | The `id` of the active step. Steps before this index are considered completed. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`   | Layout direction. |
| `readonly`    | `boolean`                     | `true`           | When `false`, clicking a completed step navigates back to it. |
| `compact`     | `boolean`                     | `false`          | Smaller icon and text size. Descriptions are hidden in compact mode. |
| `class`       | `string`                      | —                | Extra CSS classes on the root `<nav>` element. |

## Step type

```ts
type Step = {
    id: string;
    label: string;
    description?: string;
};
```

## Accessibility

- Root element is a `<nav aria-label="Progress">`.
- Steps are rendered as an ordered list `<ol>`.
- The active step has `aria-current="step"`.
- Completed steps include an `sr-only` "(Completed)" label for screen readers.
- When `readonly={false}`, completed steps render as `<button>` elements.

## Usage

```sveltehtml
<script>
    import { Stepper } from 'atom-forge';

    const steps = [
        { id: 'info',    label: 'Basic info',  description: 'Fill in your details.' },
        { id: 'address', label: 'Address',      description: 'Where should we ship?' },
        { id: 'review',  label: 'Review',       description: 'Double-check your order.' },
        { id: 'submit',  label: 'Submit' },
    ];

    let current = $state('address');
</script>

<Stepper {steps} bind:current readonly={false} />
```
