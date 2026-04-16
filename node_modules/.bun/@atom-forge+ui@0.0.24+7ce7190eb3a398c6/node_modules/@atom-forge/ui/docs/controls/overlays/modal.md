# Modal

An imperative modal system. Open any Svelte component as a stacked modal dialog via `getModalManager()`. `open()` returns a Promise that resolves when the modal closes.

## Import

```sveltehtml
import { getModalManager } from '@atom-forge/ui';
```

`AtomForge` automatically provides the modal manager and renders `ModalContainer`. No manual setup is needed.

---

## ModalManager API

Obtain the manager anywhere inside the `<AtomForge>` tree:

```ts
const modal = getModalManager();
```

### `modal.open(component, props?)`

Opens a component as a modal. Returns `Promise<any>` that resolves with the value passed to `modal.close()`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `component` | `Component` | Svelte component to render. |
| `props` | `object` | Props passed to the component. |

### `modal.openSnippet(snippet, props?)`

Opens a Svelte snippet as a modal.

### `modal.close(result?)`

Closes the topmost modal and resolves its promise with `result`.

### `modal.resolve(result?)`

Alias for `close`.

---

## Usage

```sveltehtml
<script>
  import ConfirmDialog from './ConfirmDialog.svelte';
  const modal = getModalManager();

  async function deleteItem() {
    const confirmed = await modal.open(ConfirmDialog, {
      message: 'Delete this item?'
    });
    if (confirmed) await doDelete();
  }
</script>

<Button label="Delete" destructive onclick={deleteItem}/>
```

### Inside the modal component

```sveltehtml
<script>
  let { message } = $props();
  const modal = getModalManager();
</script>

<Card class="p-6 flex flex-col gap-4 w-80">
  <p>{message}</p>
  <div class="flex gap-2 justify-end">
    <Button ghost label="Cancel" onclick={() => modal.close(false)}/>
    <Button destructive label="Delete" onclick={() => modal.close(true)}/>
  </div>
</Card>
```

### Open a snippet

```sveltehtml
<script>
  const modal = getModalManager();
</script>

{#snippet confirmSnippet()}
  <Card class="p-6">
    <p>Are you sure?</p>
    <Button onclick={() => modal.close(true)}>Yes</Button>
  </Card>
{/snippet}

<Button onclick={() => modal.openSnippet(confirmSnippet)}>Open</Button>
```

---

## Stacking

Modals stack — each `open()` call adds a layer. `close()` always removes the topmost modal. Use this to build multi-step flows.
