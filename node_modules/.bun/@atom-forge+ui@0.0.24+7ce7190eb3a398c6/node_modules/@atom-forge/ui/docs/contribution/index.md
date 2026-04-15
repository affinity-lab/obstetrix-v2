# Contribution Guide

Welcome to the **atom-forge** UI library contribution guide. This documentation is split into focused pillars to help you build consistent, high-quality Svelte 5 components.

---

## 1. [Workflow](./workflow.md)
The "operations manual" for the library.
- **Key topics**: Project structure, categorization, atomic components, `todo/` & `scripts/` usage, and the **mandatory component reuse** rule.
- **Goal**: Understand where to put files and how the development lifecycle works.

## 2. [Coding Standards](./coding-standards.md)
Technical coding guidelines and best practices.
- **Key topics**: Relative imports, mandatory use of runes ($state, $derived), snippets vs slots, and event handling.
- **Goal**: Ensure the codebase is consistent, type-safe, and follows Svelte 5 best practices.

## 3. [Styling & Color System](./styling.md)
Visual consistency and Tailwind CSS standards.
- **Key topics**: `twMerge` usage, the semantic color system (tokens vs hardcoding), and size naming conventions (`normal`, `compact`, `small`).
- **Goal**: Maintain visual integrity and perfect Dark/Light mode support.

## 4. [Library Helpers & Utilities](./helpers.md)
Documentation for the shared internal toolbox.
- **Key topics**: Common types (`ClassProp`, `AnyProp`), utility functions (`variantMap`, `debounce`), and helper components (`RenderSnippet`, `Spinner`).
- **Goal**: Reuse internal helpers instead of reinventing common patterns.

## 5. [Documentation Guide](./documentation.md)
Standards, structure, and rules for creating and maintaining component documentation.

---

## Quick Rules

- **Pure Library**: This project contains only the library source and documentation.
- **Documentation**: When modifying a control, **ALWAYS** update its markdown file.
- **All documentation is in English**.
- **Bun**: Use `bun` for development.
