import { a as attr_class, o as clsx, d as escape_html, f as sanitize_props, s as spread_props, h as slot, p as rest_props, q as fallback, t as attributes, e as ensure_array_like, v as element, w as bind_props } from './renderer-Dl7nK692.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';
import { I as Icon$1 } from './Icon-CngImbf_.js';

function EmptyState($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { icon, title, description, class: classes, children } = $$props;
    $$renderer2.push(`<div${attr_class(clsx(twMerge("flex flex-col items-center justify-center gap-3 py-12 text-center", classes)))}><div class="text-muted-contrast opacity-40">`);
    Icon$1($$renderer2, { icon, size: "12" });
    $$renderer2.push(`<!----></div> <p class="text-base font-medium text-canvas-contrast">${escape_html(title)}</p> `);
    if (description) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-sm text-muted-contrast max-w-xs">${escape_html(description)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (children) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mt-1">`);
      children($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const defaultAttributes = {
  outline: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  },
  filled: {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none"
  }
};
function Icon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["type", "name", "color", "size", "stroke", "iconNode"]);
  $$renderer.component(($$renderer2) => {
    let type = $$props["type"];
    let name = $$props["name"];
    let color = fallback($$props["color"], "currentColor");
    let size = fallback($$props["size"], 24);
    let stroke = fallback($$props["stroke"], 2);
    let iconNode = $$props["iconNode"];
    $$renderer2.push(`<svg${attributes(
      {
        ...defaultAttributes[type],
        ...$$restProps,
        width: size,
        height: size,
        class: `tabler-icon tabler-icon-${name} ${$$sanitized_props.class ?? ""}`,
        ...type === "filled" ? { fill: color } : { "stroke-width": stroke, stroke: color }
      },
      void 0,
      void 0,
      void 0,
      3
    )}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, { type, name, color, size, stroke, iconNode });
  });
}
function Archive($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2"
      }
    ],
    [
      "path",
      { "d": "M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10" }
    ],
    ["path", { "d": "M10 12l4 0" }]
  ];
  Icon($$renderer, spread_props([
    { type: "outline", name: "archive" },
    $$sanitized_props,
    {
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}

export { Archive as A, EmptyState as E };
//# sourceMappingURL=archive-CX0SI3gq.js.map
