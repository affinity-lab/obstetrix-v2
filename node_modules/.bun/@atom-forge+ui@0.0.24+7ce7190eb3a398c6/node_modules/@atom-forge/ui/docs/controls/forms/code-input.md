# Code Input

A segmented input for fixed-length codes — OTPs, PIN codes, licence keys, activation codes. Visually renders individual character boxes while using a single hidden `<input>` underneath for accessibility and native paste support.

## Import

```sveltehtml
import { CodeInput } from '$lib';
```

---

## Props

| Prop           | Type                                                                           | Default | Description                                                                                                                                                                              |
|----------------|--------------------------------------------------------------------------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `value`        | `string`                                                                       | `''`    | Bindable. Only the **editable** portion — prefix characters are excluded.                                                                                                                |
| `layout`       | `number \| number[]`                                                           | `6`     | A number creates that many boxes. An array (e.g. `[4, 4, 4]`) creates groups separated by `separator`.                                                                                   |
| `separator`    | `string`                                                                       | `'-'`   | Character rendered between groups when `layout` is an array.                                                                                                                             |
| `prefix`       | `string`                                                                       | `''`    | Pre-filled read-only characters at the start. Prefix boxes are dimmed and non-interactive. `value` contains only the editable portion. Paste automatically strips the prefix if present. |
| `characterSet` | `'any' \| 'numeric' \| 'alpha' \| 'alphanumeric' \| (char: string) => boolean` | `'any'` | Restricts accepted characters. Pass a function for fully custom validation.                                                                                                              |
| `placeholder`  | `string`                                                                       | `''`    | Character displayed inside empty editable boxes.                                                                                                                                         |
| `uppercase`    | `boolean`                                                                      | `false` | Auto-converts every character to uppercase on input and paste. Also normalises `prefix`.                                                                                                 |
| `disabled`     | `boolean`                                                                      | `false` | Disables the entire input.                                                                                                                                                               |
| `compact`      | `boolean`                                                                      | —       | Compact size (`w-8 h-10`). Mutually exclusive with `small`.                                                                                                                              |
| `small`        | `boolean`                                                                      | —       | Small size (`w-6 h-8`). Mutually exclusive with `compact`.                                                                                                                               |
| `onComplete`   | `(value: string) => void`                                                      | —       | Called once every **editable** box is filled. Receives only the editable portion.                                                                                                        |

---

## Keyboard

| Key             | Action                                                                |
|-----------------|-----------------------------------------------------------------------|
| `0–9 / A–Z / …` | Enter character, advance to next box                                  |
| `ArrowRight`    | Move focus to next box                                                |
| `ArrowLeft`     | Move focus to previous box                                            |
| `Backspace`     | Clear current box; if already empty, clear previous box and move back |
| `Delete`        | Same as Backspace                                                     |

---

## Paste

Pasting text fills editable boxes from the current position onwards. Only characters accepted by `characterSet` are used — the rest are silently skipped. If the pasted string starts with the `prefix`, it is automatically stripped before filling. `onComplete` fires if all editable boxes end up filled.

---

## Usage

### OTP — 6-digit numeric

```sveltehtml

<script>
	let otp = $state('');
</script>

<CodeInput
	bind:value={otp}
	layout={6}
	characterSet="numeric"
	placeholder="·"
	onComplete={(v) => toast.show(`Code: ${v}`, { type: 'success' })}
/>
```

### Licence key — grouped layout

```sveltehtml

<CodeInput
	bind:value={key}
	layout={[4, 4, 4, 4]}
	separator="-"
	characterSet="alphanumeric"
	uppercase
	placeholder="·"
/>
<!-- renders: XXXX - XXXX - XXXX - XXXX -->
```

### Prefix — SMS verification code

```sveltehtml
<!-- layout [3,3], first group is the read-only prefix "ABC" -->
<CodeInput
	bind:value={code}
	layout={[3, 3]}
	separator="-"
	characterSet="numeric"
	prefix="ABC"
	placeholder="·"
/>
<!-- renders: ABC - ··· -->
<!-- value contains only the 3 editable digits -->
```

### Custom character set — hex only

```sveltehtml

<script>
	const isHex = (char: string) => /^[0-9a-fA-F]$/.test(char);
</script>

<CodeInput
	bind:value={hex}
	layout={6}
	characterSet={isHex}
	uppercase
	placeholder="0"
/>
```

### Sizes

```sveltehtml

<CodeInput bind:value={a} layout={4} characterSet="numeric"/>          <!-- normal (default) -->
<CodeInput bind:value={b} layout={4} characterSet="numeric" compact/>  <!-- compact -->
<CodeInput bind:value={c} layout={4} characterSet="numeric" small/>    <!-- small -->
```

### With Field wrapper

```sveltehtml

<Field label="Verification code">
	<CodeInput bind:value={code} layout={6} characterSet="numeric"/>
</Field>
```

---

## Notes

- A single hidden `<input>` handles all browser events (focus, keyboard, paste, `autocomplete="one-time-code"` for SMS OTP autofill on mobile). Its `maxlength` is set to the editable length only (total − prefix length).
- The visible boxes are purely presentational — clicking any editable box focuses the hidden input and moves the internal cursor to that position. Prefix boxes are not clickable.
- The active empty box shows a blinking accent cursor when no `placeholder` is set.
- `uppercase` normalises both typed input and pasted text, including the `prefix`.
- `onComplete` fires on every fill-up — including via paste — and receives only the editable portion (without the prefix).
- `value` never contains prefix characters. To get the full code, concatenate manually: `` `${prefix}${value}` ``.
