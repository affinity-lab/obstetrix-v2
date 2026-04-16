import { r as run, a as attr_class, o as clsx, k as attr, j as stringify, c as attr_style, d as escape_html, w as bind_props, l as derived } from './renderer-Dl7nK692.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';
import { I as Icon } from './Icon-CngImbf_.js';

function Switch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = false,
      checked = void 0,
      onchange,
      label = void 0,
      icons = void 0,
      disabled,
      compact,
      small,
      class: classes
    } = $$props;
    const size = run(() => small ? "small" : compact ? "compact" : "normal");
    const usingChecked = run(() => checked !== void 0);
    const isChecked = derived(() => usingChecked ? checked ?? false : value);
    const thumbTranslateX = run(() => size === "normal" ? "1.25rem" : size === "compact" ? "1rem" : "0.75rem");
    const wrapperClass = derived(() => twMerge("relative inline-flex items-center cursor-pointer", disabled && "cursor-not-allowed opacity-50", classes));
    const trackClass = derived(() => twMerge("rounded-full transition-colors duration-200 ease-in-out shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]", isChecked() ? "bg-accent" : "bg-secondary", disabled && "striped-10", size === "normal" && "w-11 h-6", size === "compact" && "w-9 h-5", size === "small" && "w-7 h-4"));
    const thumbClass = twMerge("bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out pointer-events-none flex items-center justify-center", size === "normal" && "h-5 w-5", size === "compact" && "h-4 w-4", size === "small" && "h-3 w-3");
    const iconClass = twMerge("text-muted-contrast", size !== "normal" && "hidden");
    $$renderer2.push(`<label${attr_class(clsx(wrapperClass()))}><input type="checkbox" class="sr-only peer"${attr("checked", isChecked(), true)}${attr("disabled", disabled, true)}/> <div${attr_class(`relative ${stringify(trackClass())}`)}><div${attr_class(clsx(thumbClass))}${attr_style(`transform: ${stringify(isChecked() ? `translateX(${thumbTranslateX})` : "translateX(0)")}; margin: 0.125rem;`)}>`);
    if (icons) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="relative w-full h-full flex items-center justify-center text-xs"><span${attr_class("absolute transition-opacity duration-200", void 0, { "opacity-100": isChecked(), "opacity-0": !isChecked() })}>`);
      Icon($$renderer2, { icon: icons.on, pxSize: "18", class: iconClass });
      $$renderer2.push(`<!----></span> <span${attr_class("absolute transition-opacity duration-200", void 0, { "opacity-100": !isChecked(), "opacity-0": isChecked() })}>`);
      Icon($$renderer2, { icon: icons.off, pxSize: "18", class: iconClass });
      $$renderer2.push(`<!----></span></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (label) {
      $$renderer2.push("<!--[0-->");
      if (typeof label === "string") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="ms-3 text-sm font-medium text-canvas-contrast">${escape_html(label)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="ms-3 grid grid-cols-1 grid-rows-1 text-sm font-medium text-canvas-contrast"><span${attr_class("col-start-1 row-start-1 transition-opacity duration-200", void 0, { "opacity-100": isChecked(), "opacity-0": !isChecked() })}>${escape_html(label.on)}</span> <span${attr_class("col-start-1 row-start-1 transition-opacity duration-200", void 0, { "opacity-100": !isChecked(), "opacity-0": isChecked() })}>${escape_html(label.off)}</span></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></label>`);
    bind_props($$props, { value, checked });
  });
}
function Textarea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = "",
      dirty = false,
      placeholder,
      disabled = false,
      invalid = false,
      rows = 3,
      maxRows,
      resizable = false,
      monospace = false,
      handleTab = false,
      tabSize = 2,
      maxLength,
      showCounter = false,
      compact,
      small,
      class: classes,
      adornment,
      counter
    } = $$props;
    const lineHeightPx = derived(() => small ? 18 : compact ? 18 : 20);
    const charCount = derived(() => value.length);
    const wordCount = derived(() => value.trim() === "" ? 0 : value.trim().split(/\s+/).length);
    const letterCount = derived(() => value.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/g, "").length);
    function wrapSelection(wrap, unwrapWhenWrapped = false) {
      return;
    }
    function insertAtCursor(text) {
      return;
    }
    function selectAll() {
    }
    function focus(at = "beginning") {
      return;
    }
    const size = derived(() => small ? "small" : compact ? "compact" : "normal");
    const wrapperClass = derived(() => twMerge("relative flex flex-col rounded-control border bg-control border-frame transition-colors overflow-hidden", size() === "compact" && "text-xs", size() === "small" && "text-[12px]", disabled && "cursor-not-allowed bg-muted/50 opacity-70 striped-10", invalid ? "border-error text-error" : "border-frame", classes));
    const taClass = derived(() => twMerge("w-full bg-transparent border-none focus:ring-0 disabled:cursor-not-allowed text-canvas-contrast placeholder:text-muted-contrast leading-5", size() === "normal" && "px-3 py-2 text-sm", size() === "compact" && "px-2 py-1 text-xs", size() === "small" && "px-2 py-1 text-[12px]", monospace && "font-mono", !resizable && "resize-none", (showCounter || adornment) && (size() === "normal" ? "pb-7" : "pb-6")));
    const minHeightStyle = derived(() => () => {
      const padY = size() === "normal" ? 16 : 8;
      return `min-height: ${rows * lineHeightPx() + padY}px;`;
    });
    $$renderer2.push(`<div${attr_class(clsx(wrapperClass()))}><div class="relative flex-1"><textarea${attr_class(clsx(taClass()))}${attr_style(minHeightStyle()())}${attr("placeholder", placeholder)}${attr("disabled", disabled, true)}${attr("maxlength", maxLength)}>`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> `);
    if (adornment || showCounter) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute bottom-2 right-2 flex items-center gap-2">`);
      if (showCounter) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="pointer-events-none">`);
        if (counter) {
          $$renderer2.push("<!--[0-->");
          counter($$renderer2, {
            count: charCount(),
            max: maxLength,
            words: wordCount(),
            letters: letterCount()
          });
          $$renderer2.push(`<!---->`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span${attr_class(clsx(twMerge("text-muted-contrast tabular-nums", size() === "normal" ? "text-xs" : "text-[10px]", maxLength && charCount() >= maxLength && "text-error")))}>${escape_html(charCount())}`);
          if (maxLength) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="opacity-50">/${escape_html(maxLength)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></span>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (adornment) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div>`);
        adornment($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, {
      value,
      dirty,
      wrapSelection,
      insertAtCursor,
      selectAll,
      focus
    });
  });
}

export { Switch as S, Textarea as T };
//# sourceMappingURL=Textarea-DB5XRuPX.js.map
