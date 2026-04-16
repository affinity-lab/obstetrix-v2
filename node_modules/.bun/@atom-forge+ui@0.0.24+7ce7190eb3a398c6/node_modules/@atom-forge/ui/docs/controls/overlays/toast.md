# Toast

Lightweight notification toasts stacked in a fixed overlay. Opened imperatively via `getToastManager()`. Auto-dismiss after a configurable duration.

## Import

```sveltehtml
import { getToastManager } from '@atom-forge/ui';
```

`AtomForge` automatically provides the toast manager and renders the overlay. No manual setup is needed.

---

## ToastManager API

Obtain the manager anywhere inside the `<AtomForge>` tree:

```ts
const toast = getToastManager();
```

### `toast.show(message, options?)`

Shows a toast and returns its `id` string. Auto-dismisses after `duration` ms (default 3000).

### `toast.dismiss(id)`

Manually removes a toast by its id.

---

## ToastOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Sets the accent bar color and default icon. |
| `duration` | `number` | `3000` | Auto-dismiss delay in ms. `0` = never auto-dismiss. |
| `closable` | `boolean` | `true` | Shows a close button. |
| `icon` | `IconDefinition` | — | Overrides the default type icon. |
| `action` | `{ label: string; callback: () => void }` | — | Adds an action button inside the toast. |

---

## Usage

```sveltehtml
<script>
  const toast = getToastManager();
</script>

<Button label="Info"    onclick={() => toast.show('File saved.')}/>
<Button label="Success" onclick={() => toast.show('Upload complete!', { type: 'success' })}/>
<Button label="Warning" onclick={() => toast.show('Low disk space.', { type: 'warning' })}/>
<Button label="Error"   onclick={() => toast.show('Connection failed.', { type: 'error' })}/>
```

### Persistent with action

```sveltehtml
toast.show('New version available.', {
  type: 'info',
  duration: 0,
  action: {
    label: 'Update',
    callback: () => triggerUpdate(),
  },
});
```

### Manual dismiss

```sveltehtml
const id = toast.show('Processing...', { duration: 0, closable: false });
await doWork();
toast.dismiss(id);
```
