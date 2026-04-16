# Getting Started

UI is a Svelte 5 component library built with Tailwind CSS 4. It provides composable, themeable UI components — from basic inputs and buttons to overlays, charts, and data tables.

---

## Requirements

- Svelte 5
- SvelteKit
- Tailwind CSS 4
- `lucide-svelte` (peer dep for icons)
- `tailwind-merge` (peer dep)

---

## Installation

```bash
npm install @atom-forge/ui
```

---

## CSS setup

Add these lines to your app's CSS entry point (`src/app.css`):

```css
@import "tailwindcss";

/* 1. Import semantic tokens and base styles */
@import "../node_modules/@atom-forge/ui/dist/core/theme.css";

/* 2. Tell Tailwind to scan the library for utility classes */
@source "../node_modules/@atom-forge/ui/dist";

/* 3. Ensure your own project files are scanned */
@source ".";
```

The `@source` directive for `node_modules` is required because Tailwind CSS 4 does not scan `node_modules` by default. Without it, the utility classes used inside **atom-forge** components won't be included in your bundle.

`@atom-forge/ui/dist/core/theme.css` defines the semantic color tokens, surface layers, and utility classes that all components depend on.

---

## Layout setup

Import your CSS and wrap the root layout with `<UI>`. This single component:

- Registers all overlay managers (Modal, Toast, Drawer, Popup)
- Sets up dark mode with `localStorage` persistence and `prefers-color-scheme` detection
- Renders portal targets and overlay containers

```sveltehtml
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { UI } from '@atom-forge/ui';
  let { children } = $props();
</script>

<UI dark>
  {@render children()}
</UI>
```

### UI props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dark` | `boolean` | `false` | Start in dark mode if no preference is saved. Overrides `prefers-color-scheme`. |
| `light` | `boolean` | `false` | Start in light mode if no preference is saved. Overrides `prefers-color-scheme`. |

Without either prop, `prefers-color-scheme` determines the initial value. On subsequent visits, the saved `localStorage` value takes precedence over both props.

---

## Importing components

All components are exported from the root package:

```ts
import { Button, Input, Card, Select, Switch } from '@atom-forge/ui';
```

---

## Your first component

```sveltehtml
<script lang="ts">
  import { Button } from '@atom-forge/ui';
  import { Plus, Trash } from 'lucide-svelte';
</script>

<Button label="Add item" icon={Plus}/>
<Button label="Delete" destructive/>
<Button label="Cancel" ghost/>
<Button icon={Trash} destructive compact/>
```

---

## Dark mode

`getThemeManager()` is available anywhere inside the `<UI>` tree. Bind `theme.dark` directly:

```sveltehtml
<script lang="ts">
  import { getThemeManager, Switch } from '@atom-forge/ui';
  import { Moon, Sun } from 'lucide-svelte';

  const theme = getThemeManager();
</script>

<Switch bind:value={theme.dark} icons={{ on: Moon, off: Sun }}/>
```

### Preventing flash on load

Without extra steps, users in dark mode will briefly see a white page before the saved preference is applied — a classic FOUC. To eliminate this, add a small blocking script to `app.html` **before** `%sveltekit.head%`. It reads `localStorage` synchronously and adds the `dark` class to `<html>` before the first paint:

```html
<!-- src/app.html -->
<head>
  <!-- Add this BEFORE %sveltekit.head% -->
  <script>
    (function() {
      try {
        var saved = localStorage.getItem('dark');
        if (saved !== null) {
          if (JSON.parse(saved)) document.documentElement.classList.add('dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  </script>
  %sveltekit.head%
</head>
```

The script is intentionally render-blocking (no `async`/`defer`) so it always runs before any content is painted. The `try/catch` handles environments where `localStorage` is unavailable (e.g. private browsing with strict settings).

---

## Overlay managers

UI provides four imperative managers for overlay UI. All return `Promise<T>` that resolves when the overlay closes.

### Toast

```ts
const toast = getToastManager();
toast.show('File saved!', { type: 'success' });
toast.show('Upload failed.', { type: 'error', duration: 0 });
```

### Modal

```ts
const modal = getModalManager();
const result = await modal.open(ConfirmDialog, { message: 'Delete this?' });
```

### Drawer

```ts
const drawer = getDrawerManager();
const result = await drawer.open(SettingsPanel, {}, { position: 'right', size: 'md' });
```

### Popup

```ts
const popup = getPopupManager();
const result = await popup.open.component(ContextMenu, { config: [...] }, { anchor: event });
```

None of these require manual container placement — `<UI>` handles everything.

---

## Next steps

- [Color System](./color-system.md) — semantic color tokens, dark/light theming
- [Button](../controls/general/button.md) — full prop reference for the most used component
- [Modal](../controls/overlays/modal.md) — async modal pattern in depth
- [Table](../controls/data/table.md) — generic typed data table
