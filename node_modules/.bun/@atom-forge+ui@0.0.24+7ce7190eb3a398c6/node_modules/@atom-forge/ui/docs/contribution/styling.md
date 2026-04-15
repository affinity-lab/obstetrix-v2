# Styling & Color System Standards

This guide outlines the standards for styling and visual consistency in the **atom-forge** UI library.

---

## Styling — Use `twMerge` consistently
All components should use `tailwind-merge` to handle class merging and overrides correctly.

```sveltehtml
import { twMerge } from 'tailwind-merge';

// Reactive (depends on reactive state/props):
const labelClass = $derived(twMerge('base classes', condition && 'extra class'));

// Frozen (depends only on init-time props, use plain const):
const trackClass = twMerge('base classes', size === 'normal' && 'h-6');
```

- **Plain `const`**: classes that depend only on props frozen with `untrack()` (size, type, etc.)
- **`$derived`**: classes that depend on reactive props (`disabled`, `invalid`, `checked`, etc.)

---

## Color system
Detailed specifications in [docs/guides/color-system.md](../guides/color-system.md).

Only colors defined in the color system (semantic tokens) or values derived from them (e.g., using opacity modifiers like `text-accent/80`) are allowed. Hardcoded Tailwind colors (e.g., `text-blue-500`) or hex codes are strictly forbidden. Always use semantic tokens like `text-accent` or `bg-surface-primary`.

### Theme Tokens
❌ Never:
```sveltehtml
<div class="text-blue-500 bg-[#ffffff]">
```
✅ Use:
```sveltehtml
<div class="text-accent bg-surface-primary">
```

---

## Size naming
Always use standardized size names. Never use Tailwind-style abbreviations like `sm`, `md`, or `lg`.

Always use:
```typescript
'normal' | 'compact' | 'small'
```
Never use:
```typescript
'sm' | 'md' | 'lg'
```

### Size/Mode Selection
Boolean props are cleaner to use in templates (`{#if small}` vs `{#if size === 'small'}`). Use `XOR` or `AtLeastOne` to enforce mutual exclusivity or presence, then resolve to a string using `variantMap`.

❌ Never:
```typescript
size?: 'small' | 'compact';
```
✅ Use:
```typescript
small?: boolean;
compact?: boolean;
// Enforce with XOR or AtLeastOne, then resolve via variantMap
```

Freeze size at init:
```typescript
const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');
```
