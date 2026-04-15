# Drawer

A slide-in panel anchored to the left or right edge of the screen. Opened imperatively via `getDrawerManager()`. Supports async resolution — `open()` returns a Promise that resolves when the drawer closes.

## Import

```sveltehtml
import { getDrawerManager } from '@atom-forge/ui';
```

`AtomForge` automatically provides the drawer manager and renders the overlay. No manual setup is needed.

---

## DrawerManager API

Obtain the manager anywhere inside the `<AtomForge>` tree:

```ts
const drawer = getDrawerManager();
```

### `drawer.open(component, props?, options?)`

Opens a drawer and returns a `Promise<T>` that resolves when `drawer.close(result)` is called.

| Parameter | Type | Description |
|-----------|------|-------------|
| `component` | `Component` | Svelte component to render inside the drawer. |
| `props` | `object` | Props passed to the component. |
| `options` | `DrawerOptions` | Position, size, closable. |

### `drawer.close(result?)`

Closes the topmost drawer and resolves its promise with `result`.

---

## DrawerOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'left' \| 'right'` | `'right'` | Which edge the drawer slides from. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Panel width. |
| `closable` | `boolean` | `true` | Whether clicking the backdrop closes the drawer. |

### Size reference

| Size | Width |
|------|-------|
| `sm` | `w-96` (384px) |
| `md` | `w-128` (512px) |
| `lg` | `w-192` (768px) |
| `full` | `w-full` |

---

## Usage

```sveltehtml
<script>
  import MyPanel from './MyPanel.svelte';
  const drawer = getDrawerManager();

  async function openPanel() {
    const result = await drawer.open(MyPanel, { title: 'Settings' }, {
      position: 'right',
      size: 'md',
    });
    console.log('Drawer closed with:', result);
  }
</script>

<Button label="Open Drawer" onclick={openPanel}/>
```

### Inside the drawer component

```sveltehtml
<script>
  const drawer = getDrawerManager();
</script>

<div class="p-6 flex flex-col h-full">
  <h2>Settings</h2>
  <div class="grow">...</div>
  <Button label="Save" onclick={() => drawer.close('saved')}/>
</div>
```
