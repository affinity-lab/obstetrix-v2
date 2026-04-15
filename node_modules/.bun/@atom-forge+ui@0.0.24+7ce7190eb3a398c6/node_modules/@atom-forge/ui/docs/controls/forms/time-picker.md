# TimePicker

A styled wrapper around the native `<input type="time">`. The browser's built-in time picker handles interaction; the component provides a consistent look matching `DatePicker` and `Select`.

## Import

```sveltehtml
import { TimePicker } from '@atom-forge/ui';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | `null` | Bindable time value. Format: `"HH:MM"` or `"HH:MM:SS"` when `seconds` is set. |
| `seconds` | `boolean` | `false` | Sets `step=1` on the native input to expose seconds. Changes value format to `"HH:MM:SS"`. |
| `placeholder` | `string` | `'Select time'` | Text shown when no time is selected. |
| `disabled` | `boolean` | `false` | Disables the picker. |
| `clearable` | `boolean` | `false` | Shows an × button to clear the selected time. |
| `round` | `false \| 0 \| 5 \| 10 \| 15 \| 20 \| 30 \| number[]` | `false` | Round to the nearest interval. `0` = nearest hour, `5`–`30` = nearest N minutes, `number[]` = snap to the nearest value in the list (e.g. `[0, 15, 30, 45]`). |
| `compact` | `boolean` | `false` | Compact size — `h-8`. Mutually exclusive with `small`. |
| `small` | `boolean` | `false` | Small size — `h-6`. Mutually exclusive with `compact`. |
| `class` | `string` | — | Additional CSS classes for the trigger element. |

---

## Behavior

- A hidden `<input type="time">` is anchored inside the container; `showPicker()` opens the native picker near the component (Chrome 99+, Edge, Safari 16+, falls back to `.click()`).
- The clock icon (separated by a vertical divider) triggers the native picker.
- The text field is directly editable — accepts `HH:MM` (or `HH:MM:SS` with `seconds`); value updates on blur/enter.
- `value` is kept in sync from both the native picker and the text field.

---

## Usage

```sveltehtml
<!-- Basic -->
<TimePicker bind:value clearable/>

<!-- With seconds -->
<TimePicker bind:value seconds clearable/>

<!-- Sizes -->
<TimePicker bind:value compact/>
<TimePicker bind:value small/>

<!-- Disabled -->
<TimePicker value="09:00" disabled/>

<!-- Rounding -->
<TimePicker bind:value round={0}/>       <!-- nearest hour: 09:23 → 09:00 -->
<TimePicker bind:value round={10}/>      <!-- nearest 10 min: 09:23 → 09:20 -->
<TimePicker bind:value round={15}/>      <!-- nearest 15 min: 09:07 → 09:15 -->
<TimePicker bind:value round={30}/>      <!-- nearest 30 min -->

<!-- Snap to list: nearest of 0, 15, 30, 45 -->
<TimePicker bind:value round={[0, 15, 30, 45]}/>

<!-- Custom list: 10, 30, 50 minutes -->
<TimePicker bind:value round={[10, 30, 50]}/>
```
