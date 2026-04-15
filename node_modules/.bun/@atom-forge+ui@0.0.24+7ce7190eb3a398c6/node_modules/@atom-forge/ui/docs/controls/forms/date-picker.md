# DatePicker

A single-date selector with a popup calendar. Styled consistently with `Select` and `Input`. Supports min/max bounds, disabled dates, custom weekday start, and a clearable option.

## Import

```ts
import { DatePicker } from 'atom-forge';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | `null` | Bindable selected date. |
| `format` | `(date: Date) => string` | en-US short | Custom date formatter. |
| `placeholder` | `string` | `'Select date'` | Text shown when no date is selected. |
| `disabled` | `boolean` | `false` | Disables the picker. |
| `clearable` | `boolean` | `false` | Shows an × button to clear the selection. |
| `min` | `Date` | — | Earliest selectable date (inclusive). |
| `max` | `Date` | — | Latest selectable date (inclusive). |
| `weekStart` | `0 \| 1` | `1` | First day of the week. `0` = Sunday, `1` = Monday. |
| `disabledDates` | `Date[]` | — | Specific dates to disable. |
| `disabledDays` | `number[]` | — | Days of the week to disable. `[0, 6]` disables weekends. |
| `compact` | `boolean` | — | Compact size — `h-8`. Mutually exclusive with `small`. |
| `small` | `boolean` | — | Small size — `h-6`. Mutually exclusive with `compact`. |
| `class` | `string` | — | Additional CSS classes for the trigger element. |

## Usage

```sveltehtml
<DatePicker bind:value={myDate} clearable />
```

### With constraints

```sveltehtml
<script>
  const today = new Date();
</script>

<DatePicker bind:value={date} min={today} disabledDays={[0, 6]} />
```

### Custom format

```sveltehtml
<DatePicker bind:value={date} format={d => d.toLocaleDateString('hu-HU')} />
```
