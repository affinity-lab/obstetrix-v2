# Library Helpers & Utilities

This guide documents the shared utilities, types, and helper components available in the `src/lib/helpers/` directory.

---

## Types

### Class Prop
Standard type for components that accept external CSS classes.
```ts
let { class: classes }: ClassProp = $props();
const cls = $derived(twMerge('base-styles', classes));
```

### Any Prop
For extra HTML attributes to be spread onto elements (`...props`). Always place at the end of the intersection.
```ts
let { class: classes, ...props }: ClassProp & AnyProp = $props();
// ...
<input {...props} class={cls} />
```

### Children Props
Consistent naming for snippet props.
```ts
// Standard children snippet
let { children }: ChildrenProp = $props();

// Parameterized snippet
let { children }: ChildrenProp<[Item]> = $props();
```

### XOR
Enforce mutually exclusive props instead of string unions for better type safety.
```ts
// small OR compact, but not both
type Props = XOR<{ small: true }, { compact: true }, {}>;

// 3+ exclusive variants
type ButtonProps = XOR<{ primary: true }, { secondary: true }, { ghost: true }, {}>;
```

### At Least One
Ensures that at least one of the properties in an object is provided.
```ts
type LabelOrIcon = AtLeastOne<{ label: string; icon: IconDefinition }>;
```

---

## Utilities

### Variant Map
Boolean props are simpler in templates; `variantMap` returns the string value for internal logic. Works best when combined with `XOR` or `AtLeastOne` prop types.
```ts
const { small, compact, ...props } = $props();
const size = untrack(() => variantMap({ small, compact }, 'normal'));
// Returns 'small' | 'compact' | 'normal'
```

### Debounce
Standard utilities to limit function execution rate.
```ts
const handleInput = debounce((val) => {
    console.log(val);
}, 300);

const search = debounceAsync(async (query) => {
    return await api.fetch(query);
}, 500);
```

### As
TypeCast helper for templates and snippets. It allows you to cast values inline without needing to write custom helper functions or complex TypeScript assertions in Svelte templates.

**Generic Usage:**
```ts
const user = as<{ name: string, age: number }>(userData); // adds type safety to userData
```

**Generic Factor Usage:**
```ts
const mySnippetArgs = as<{id: string, age:number}> // creates a type caster function
```

**Primitive Shorthands:**
You can use the built-in shorthands for common types directly:
```svelte
<!-- Inline casting in templates -->
{@render mySnippet(as.string(someValue))}
{@render toggle(as.boolean(isActive))}
{@render list(as.array<string>(items))}

<!-- Using in logic -->
const id = as.number(params.id);
```

Available shorthands: `as.string`, `as.number`, `as.boolean`, `as.array`, `as.object`, `as.function`, `as.any`, `as.unknown`.

---

## Dynamic Rendering

### RenderSnippet.svelte
A helper component to safely render snippets dynamically.
- **Purpose**: Svelte 5's `{@render ...}` tag can be tricky with dynamic or potentially `undefined` snippet references.
- **Component compatibility**: Especially useful when an API expects a **Component**. You can "trick" it by passing `RenderSnippet` wrapping your snippet.
```sveltehtml
<RenderSnippet {snippet} args={{ item, index }} />
```

### Spinner.svelte
Simple SVG spinner with `ClassProp` support.
```sveltehtml
<Spinner class="w-4 h-4 text-accent" />
```
