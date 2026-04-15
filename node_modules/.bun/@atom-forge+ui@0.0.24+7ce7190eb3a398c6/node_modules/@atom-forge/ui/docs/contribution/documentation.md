# Documentation Guide

This guide outlines the standards and structure for documenting components in the **atom-forge** UI library. Consistent documentation ensures that developers can quickly understand and implement controls.

---

## File Location & Naming

Component documentation files are located in `docs/controls/[category]/[component-name].md`.
- Use **kebab-case** for file names (e.g., `date-picker.md`).
- Ensure the file is placed in the correct category: `data`, `display`, `forms`, `general`, `layout`, or `overlays`.

---

## Structure

Every component documentation file should follow this standard structure:

### 1. Title & Description
Start with a Level 1 header (`#`) for the component name, followed by a brief, high-level description of what the component does.
```markdown
# Button
A clickable element for triggering actions. Supports multiple variants, sizes, and icon composition.
```

### 2. Import Section
Provide the import statement for the component.

```sveltehtml
import { Button } from '@atom-forge/ui';
```

### 3. Props Section
List all available props in a markdown table. Group them logically (e.g., Content, Variants, Sizes, State) using Level 3 headers (`###`) if the list is long.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Button text. |
| `disabled` | `boolean` | `false` | Disables the button. |

### 4. Categorized Sections (Usage & Features)
Break down the component's features into logical sections using Level 2 headers (`##`). Each section should contain:
- A brief explanation of the feature.
- A `sveltehtml` code block with a practical example.
- If applicable, a table for specific values (e.g., height/font sizes for different size props).

---

## Writing Rules

### Language
- **All documentation must be in English.** Never use Hungarian or any other language for descriptions, labels, or UI text.

### Code Blocks
- Use ` ```sveltehtml ` for all Svelte example code.
- Use ` ```ts ` for pure TypeScript examples (e.g., manager APIs).
- Examples should be concise and demonstrate a single feature or state at a time.

### Tables
- Use tables for **Props**, **Events**, **Sizes**, and **Constants**.
- Tables should be easy to read and correctly aligned.

### Tone
- Use a professional, senior software engineer tone.
- Be direct and concise. Avoid filler words.

---

## Best Practices

- **Self-Documenting Examples**: Write example code that is easy to copy-paste and works with minimal modifications.
- **Mutual Exclusivity**: If props are mutually exclusive (e.g., `small` vs. `compact`), explicitly state this in the description or the props table.
- **Accessibility & Logic**: If a component has specific keyboard behaviors or internal logic (like "First truthy prop wins"), document it clearly.
- **Linking**: Link to related components or guides using relative paths (e.g., `[Color System](../guides/color-system.md)`).

---

## Verification Checklist

When creating or updating documentation:
1. [ ] Is the file in the correct `docs/controls/[category]/` folder?
2. [ ] Is the language exclusively English?
3. [ ] Are all props and their types accurate?
4. [ ] Do the code examples follow Svelte 5 standards (Runes)?
5. [ ] Is there an "Import" section at the top?
6. [ ] Are links to other components/guides working?
