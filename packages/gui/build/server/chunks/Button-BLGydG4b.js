import { t as attributes, o as clsx, c as attr_style, j as stringify, d as escape_html, a as attr_class, l as derived, r as run } from './renderer-Dl7nK692.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';
import { I as Icon } from './Icon-CngImbf_.js';

function Spinner($$renderer, $$props) {
  let { class: classes = "", $$slots, $$events, ...props } = $$props;
  $$renderer.push(`<svg${attributes(
    {
      class: `animate-spin ${stringify(classes)}`,
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      ...props
    },
    void 0,
    void 0,
    void 0,
    3
  )}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
}
function variantMap(map, defaultValue) {
  for (const [key, val] of Object.entries(map)) {
    if (val)
      return key;
  }
  return defaultValue;
}
function Button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label: text,
      icon,
      endIcon,
      children,
      // Variants (use at most one)
      secondary,
      destructive,
      ghost,
      link,
      muted,
      accent,
      // Modifiers
      outline,
      pill,
      grow,
      borderless,
      disabled,
      // Size
      compact,
      small,
      micro,
      // Loading: true = spinner only, number = progress bar (0–100)
      loading,
      onclick = (event) => {
      },
      class: classes,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const isIconOnly = run(() => !!(icon && !text && !endIcon && !children));
    const variant = derived(() => variantMap({ destructive, secondary, ghost, link, muted, accent }, "primary"));
    const isNormal = derived(() => !compact && !small && !micro);
    const isCompact = derived(() => !!compact);
    const isSmall = derived(() => !!small);
    const isMicro = derived(() => !!micro);
    const isLoading = derived(() => !!loading);
    const loadingProgress = derived(() => typeof loading === "number" ? loading : null);
    const isDisabled = derived(() => disabled || isLoading());
    const isLink = derived(() => variant() === "link");
    const isGhost = derived(() => variant() === "ghost");
    const iconSize = derived(() => isMicro() ? "3.5" : "5");
    const buttonClass = derived(() => twMerge(
      // Base — shared by all
      "group relative inline-flex items-center justify-start whitespace-nowrap",
      "font-medium leading-5 rounded-control transition-all duration-200 select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      !isDisabled() && "cursor-pointer",
      // Button-like base: visible border + clip for progress bar fill
      !isLink() && "border box-border overflow-hidden",
      // Link base: invisible border (preserves sizing), no background
      isLink() && "border border-transparent box-border bg-transparent text-accent hover:underline underline-offset-4 hover:brightness-110",
      // --- Size: applies to all variants including link ---
      isNormal() && "h-10 text-sm",
      isCompact() && "h-8 text-xs",
      isSmall() && "h-6 text-xs",
      isMicro() && "h-5 text-[10px]",
      // Padding: icon-only
      isIconOnly && isNormal() && "justify-center w-10 p-2.5",
      isIconOnly && isCompact() && "justify-center w-8 p-1.5",
      isIconOnly && isSmall() && "justify-center w-6 p-0.5",
      isIconOnly && isMicro() && "justify-center w-5 p-px",
      // Padding: with text
      !isIconOnly && isNormal() && "px-4",
      !isIconOnly && isCompact() && "px-3",
      !isIconOnly && isSmall() && "px-2",
      !isIconOnly && isMicro() && "px-1.5",
      // --- Modifiers ---
      pill && "rounded-full",
      borderless && "border-0",
      grow && "w-full",
      // --- Ghost ---
      isGhost() && "bg-transparent border-transparent text-canvas-contrast hover:bg-secondary/50",
      // --- Solid variants ---
      !outline && !isGhost() && !isLink() && variant() === "primary" && "bg-primary text-primary-contrast hover:brightness-90 dark:hover:brightness-110 border-transparent",
      !outline && !isGhost() && !isLink() && variant() === "secondary" && "bg-secondary text-secondary-contrast hover:brightness-95 dark:hover:brightness-105 border-transparent",
      !outline && !isGhost() && !isLink() && variant() === "destructive" && "bg-error text-error-contrast hover:brightness-90 dark:hover:brightness-110 border-transparent",
      !outline && !isGhost() && !isLink() && variant() === "muted" && "bg-muted text-muted-contrast hover:brightness-95 dark:hover:brightness-105 border-transparent",
      !outline && !isGhost() && !isLink() && variant() === "accent" && "bg-accent text-accent-contrast hover:brightness-90 dark:hover:brightness-110 border-transparent",
      // --- Outline variants ---
      outline && !isGhost() && !isLink() && "bg-transparent",
      outline && !isGhost() && !isLink() && variant() === "primary" && "border-primary text-canvas-contrast hover:bg-primary/5",
      outline && !isGhost() && !isLink() && variant() === "secondary" && "border-frame text-secondary-contrast hover:bg-secondary/20",
      outline && !isGhost() && !isLink() && variant() === "destructive" && "border-error text-error hover:bg-error/10",
      outline && !isGhost() && !isLink() && variant() === "muted" && "border-frame text-muted-contrast hover:bg-muted/50",
      outline && !isGhost() && !isLink() && variant() === "accent" && "border-accent text-accent hover:bg-accent/10",
      classes
    ));
    $$renderer2.push(`<button${attributes({
      class: clsx(buttonClass()),
      disabled: isDisabled(),
      ...props
    })}>`);
    if (loadingProgress() !== null) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute inset-y-0 left-0 bg-current/15 transition-[width] duration-300"${attr_style("", { width: `${stringify(loadingProgress())}%` })}></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <span class="relative flex flex-row items-center justify-center gap-2 w-full">`);
    if (isLoading()) {
      $$renderer2.push("<!--[0-->");
      Spinner($$renderer2, { class: "w-4 h-4 shrink-0" });
      $$renderer2.push(`<!----> `);
      if (loadingProgress() !== null && text) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="grow text-left">${escape_html(text)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else if (children) {
      $$renderer2.push("<!--[1-->");
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      if (icon) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-sm">`);
        Icon($$renderer2, { icon, size: iconSize() });
        $$renderer2.push(`<!----></span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (text) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span${attr_class(clsx(twMerge("text-left", (icon || endIcon) && "grow")))}>${escape_html(text)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (endIcon) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-sm">`);
        Icon($$renderer2, { icon: endIcon, size: iconSize() });
        $$renderer2.push(`<!----></span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></span></button>`);
  });
}

export { Button as B };
//# sourceMappingURL=Button-BLGydG4b.js.map
