import { a as attr_class, h as clsx, e as ensure_array_like, d as attr, c as escape_html, f as derived } from "./renderer.js";
import { t as twMerge } from "./bundle-mjs.js";
import { g as getPopupManager } from "./RenderSnippet.js";
function Breadcrumb($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { items, maxLabelLength, maxSegments, class: classes } = $$props;
    getPopupManager();
    function truncate(label) {
      if (!maxLabelLength || label.length <= maxLabelLength) return label;
      return label.slice(0, maxLabelLength) + "…";
    }
    const visibleItems = derived(() => () => {
      if (!maxSegments || items.length <= maxSegments) return items;
      const first = items[0];
      const last = items[items.length - 1];
      const hidden = items.slice(1, items.length - 1);
      return [first, { collapsed: true, hidden }, last];
    });
    $$renderer2.push(`<nav aria-label="Breadcrumb"${attr_class(clsx(twMerge("flex items-center gap-1 text-sm", classes)))}><!--[-->`);
    const each_array = ensure_array_like(visibleItems()());
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let item = each_array[i];
      const isLast = i === visibleItems()().length - 1;
      if (i > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-muted-contrast select-none">/</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (item.collapsed) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button type="button" class="px-1.5 py-0.5 text-xs text-muted-contrast hover:text-canvas-contrast hover:bg-secondary rounded transition-colors cursor-pointer leading-none" aria-label="Show hidden breadcrumb items">…</button>`);
      } else if ((item.href || item.onclick) && !isLast) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<a${attr("href", item.href ?? "#")} class="text-muted-contrast hover:text-canvas-contrast transition-colors truncate max-w-32"${attr("title", item.label)}>${escape_html(truncate(item.label))}</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<span class="text-canvas-contrast font-medium truncate max-w-48"${attr("title", item.label)}>${escape_html(truncate(item.label))}</span>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></nav>`);
  });
}
export {
  Breadcrumb as B
};
