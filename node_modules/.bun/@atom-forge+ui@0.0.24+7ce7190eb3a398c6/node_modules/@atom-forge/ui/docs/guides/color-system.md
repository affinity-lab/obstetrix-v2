# Color System

Atom Forge uses a **Semantic Pairing** system designed for perfect consistency across light and dark modes. Instead of managing dozens of color variations manually, the system relies on functional tokens that always travel in pairs: a background and its guaranteed contrast color.

---

## Core Philosophy: The Contrast Model

Every functional color in Atom Forge has a corresponding `-contrast` token. This ensures that text and icons are always legible, regardless of the active theme or the specific background color used.

- **Automatic Adaptability**: When you switch to Dark Mode, the tokens don't just change shades—they flip their meaning. For example, `primary` is dark in light mode but becomes light in dark mode.
- **Zero Hardcoding**: Never use numbered Tailwind scales like `stone-500` or hex codes in your components. By sticking to semantic tokens, your UI will perfectly support custom themes and branding.

---

## Surface Hierarchy

Surfaces define the physical structure of your app. They create depth and help users distinguish between layout containers and interactive content.

| Token       | Utility Pair                           | Description                                                              |
|:------------|:---------------------------------------|:-------------------------------------------------------------------------|
| **bg**      | `bg-canvas` / `text-canvas-contrast`   | Body background. The deepest layer of the application shell.             |
| **surface** | `bg-surface` / `text-surface-contrast` | Component surface. Used for cards, panels, modals, and drawers.          |
| **muted**   | `bg-muted` / `text-muted-contrast`     | Subtle background. Ideal for disabled states or secondary content areas. |
| **input**   | `bg-control` / `text-canvas-contrast`  | Form input background. Typically darker than surface in dark mode.       |

### Layout Example

```sveltehtml
<div class="bg-canvas min-h-screen">
  <aside class="bg-surface border-r border-frame">
    <!-- Sidebar content -->
  </aside>
  <main class="p-6">
    <Card class="p-4">
      <h2 class="text-surface-contrast">Card Title</h2>
    </Card>igen
  </main>
</div>
```

---

## Action Palettes

Action tokens are functional. They communicate intent, hierarchy, and state.

| Family        | Background     | Contrast                  | Description                                          |
|:--------------|:---------------|:--------------------------|:-----------------------------------------------------|
| **primary**   | `bg-primary`   | `text-primary-contrast`   | High-emphasis action. "Inverted" by default.         |
| **accent**    | `bg-accent`    | `text-accent-contrast`    | Brand color. Primary CTAs and active states.         |
| **secondary** | `bg-secondary` | `text-secondary-contrast` | Low-emphasis action. Ghost buttons and subtle zones. |
| **error**     | `bg-error`     | `text-error-contrast`     | Destructive action. Delete buttons and error states. |

---

## Dynamic States (Hover & Active)

Atom Forge uses Tailwind 4's dynamic modifiers to derive interaction states from the base token instead of using dedicated state variables.

- **Light Mode Hover**: Use `hover:brightness-95` or `hover:brightness-90`.
- **Dark Mode Hover**: Use `dark:hover:brightness-110` or `dark:hover:brightness-105`.
- **Ghost Hover**: Transition from transparent to `hover:bg-secondary`.

```sveltehtml
<!-- A semantic primary button -->
<button class="bg-primary text-primary-contrast hover:brightness-90 transition-all">
  Click Me
</button>

<!-- A ghost button -->
<button class="bg-transparent text-canvas-contrast hover:bg-secondary transition-colors">
  Cancel
</button>
```

---

## Technical Reference

| Utility        | Description                                                             |
|:---------------|:------------------------------------------------------------------------|
| `border-frame` | Standard 1px border used across all components.                         |
| `ring-accent`  | Standard focus ring color for accessibility.                            |
| `use-canvas`   | Shorthand for applying both background and contrast for the base layer. |
| `use-surface`  | Shorthand for cards and elevated panels.                                |
