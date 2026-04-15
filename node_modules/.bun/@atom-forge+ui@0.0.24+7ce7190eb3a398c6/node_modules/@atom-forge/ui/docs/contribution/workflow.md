# Contribution Workflow & Standards

This guide outlines the project-wide standards and the development lifecycle for the **atom-forge** UI library.

---

## Rules

- **Pure Library**: This project contains only the library source and documentation. No demo app or routes in `src`.
- **Component Reuse**: **ALWAYS** reuse existing components within the library. If a control exists (e.g., `Checkbox`), use it instead of native elements or creating a new implementation. This is one of the most critical rules to ensure consistency and maintainability. Refer to the [Component Overview](../guides/component-overview.md) for a categorized list of available controls.
- **Grouping**: Components must be placed in their respective category folder: `data`, `display`, `forms`, `general`, `layout`, or `overlays`.
- **Atomic Components**: Each component should have its own folder with an `index.ts` for clean exports.
- **Documentation**: When modifying a control, **ALWAYS** verify and update its corresponding markdown file in `docs/controls/[category]/`. Refer to the [Documentation Guide](./documentation.md) for standards and structure.
- **Workflow**: Feature requests and planned improvements are tracked in the `todo/` folder. Once a feature is implemented, move the corresponding file to the `todo/+done/` directory.
- **Scripts**: Place all automation and helper scripts in the `scripts/` directory.
- **All documentation is in English** — Never write docs, labels, descriptions, or UI text in Hungarian or any other language.
- **Bun**: Use `bun` for development (not `npm` or `pnpm`).

---

## Project layout

```
docs/controls/[category]/*.md  # component docs grouped by category
src/lib/controls/[category]/   # component source (atomic folders)
src/lib/core/                  # central library logic (Root, theme-manager, theme.css)
src/lib/helpers/               # shared utilities, types and snippets
src/lib/index.ts               # main entry point (re-exports)
scripts/                       # automation and helper scripts
todo/                          # feature requests and planned work
todo/+done/                    # implemented features
```

