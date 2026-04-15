# Zen

Fullscreen overlay for distraction-free focus mode. Wrap any content and it will be presented over a blurred, dimmed backdrop. Activated exclusively via `bind:active` — no built-in trigger.

## Import

```sveltehtml
import { Zen } from '@atom-forge/ui';
```

---

## Props

| Prop              | Type                               | Default | Description                                                                                         |
|-------------------|------------------------------------|---------|-----------------------------------------------------------------------------------------------------|
| `active`          | `boolean`                          | `false` | Bindable. Controls visibility.                                                                      |
| `closeOnEsc`      | `boolean`                          | `true`  | Close on `Escape` key.                                                                              |
| `closeOnBackdrop` | `boolean`                          | `true`  | Close when clicking the backdrop.                                                                   |
| `title`           | `string`                           | —       | Optional label rendered in a slim strip at the bottom of the overlay, inverse/primary style.        |
| `backdropClass`   | `string`                           | —       | Extra Tailwind classes on the backdrop element.                                                     |
| `zenClass`        | `string`                           | —       | Extra Tailwind classes on the inner content/layout wrapper.                                         |
| `closeButton`     | `Snippet<[{ close: () => void }]>` | —       | Custom close button. Receives a `close` callback. Defaults to a `×` button in the top-right corner. |

---

## Layout

```
dialog (fixed inset-0, z-9998, backdrop)
├── × close button (absolute top-4 right-4)
└── flex-col full height
    ├── flex-1 — centres content vertically & horizontally (max-w-3xl)
    └── title strip (shrink-0, bg-accent, bottom)
```

- Body scroll is locked while active; scrollbar width is compensated to prevent layout shift.
- `Escape` and backdrop click set `active = false`.

---

## Usage

### Focus mode editor

```sveltehtml
<script>
  let text = $state('');
  let zenActive = $state(false);
</script>

<Field label="Article">
  <Textarea bind:value={text} rows={4} showCounter/>
</Field>
<Button icon={IconArrowsMaximize} label="Zen mode" onclick={() => zenActive = true}/>

<Zen bind:active={zenActive} title="Article">
  <Textarea bind:value={text} rows={10} showCounter class="flex-1"/>
</Zen>
```

### Form in zen mode

```sveltehtml
<Button label="Write a message" onclick={() => active = true}/>

<Zen bind:active title="New Message">
  <FieldGroup labelWidth="100px" class="w-full">
    <Field label="Name" layout="horizontal">
      <Input bind:value={name}/>
    </Field>
    <Field label="Message" layout="horizontal">
      <Textarea bind:value={message} rows={8} class="flex-1"/>
    </Field>
    <FieldSpan class="flex justify-end gap-2">
      <Button label="Cancel" ghost onclick={() => active = false}/>
      <Button label="Send" onclick={() => active = false}/>
    </FieldSpan>
  </FieldGroup>
</Zen>
```

### Custom close button

```sveltehtml
<Zen bind:active {closeButton}>
  <!-- content -->
</Zen>

{#snippet closeButton({ close })}
  <button onclick={close}>
    <IconX size={14}/> Exit
  </button>
{/snippet}
```

---

## Notes

- `Zen` renders nothing when `active = false` — safe to place anywhere in the template.
- Opening is always handled externally via `bind:active = true`.
- `title` is optional — if omitted, the bottom strip is not rendered.
