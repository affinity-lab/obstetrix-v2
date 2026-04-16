import { o as sanitize_props, p as spread_props, q as slot, r as run, a as attr_class, h as clsx, c as escape_html, j as attributes, t as bind_props, f as derived, b as stringify } from "./renderer.js";
import { t as twMerge } from "./bundle-mjs.js";
import { I as Icon$1, d as defineIcon } from "./Icon.js";
import { I as Icon } from "./Icon2.js";
function Eye($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.561.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * ---
   *
   * The MIT License (MIT) (for portions derived from Feather)
   *
   * Copyright (c) 2013-2023 Cole Bemis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "eye" },
    $$sanitized_props,
    {
      /**
       * @component @name Eye
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMi4wNjIgMTIuMzQ4YTEgMSAwIDAgMSAwLS42OTYgMTAuNzUgMTAuNzUgMCAwIDEgMTkuODc2IDAgMSAxIDAgMCAxIDAgLjY5NiAxMC43NSAxMC43NSAwIDAgMS0xOS44NzYgMCIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIzIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/eye
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
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
function Input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = "",
      type = "text",
      placeholder,
      disabled,
      invalid,
      compact,
      monospace,
      small,
      icon,
      prefix,
      suffix,
      class: classes,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const size = run(() => small ? "small" : compact ? "compact" : "normal");
    const wrapperClass = derived(() => twMerge("relative flex items-center rounded-control border bg-control border-frame transition-colors", size === "normal" && "h-10 text-xs", size === "compact" && "h-8 text-xs", size === "small" && "h-6 text-xs", disabled && "cursor-not-allowed bg-muted/50 opacity-70 striped-10", monospace && "font-mono", invalid ? "border-error text-error" : "border-frame", classes));
    const inputClass = run(() => twMerge("w-full border-none bg-transparent focus:ring-0 disabled:cursor-not-allowed text-canvas-contrast placeholder:text-muted-contrast", size === "normal" && "px-3", size === "compact" && "px-2 text-sm", size === "small" && "px-2 text-xs", !!icon && "pl-9", type === "password" && "pr-9"));
    const affixClass = twMerge("flex-shrink-0 text-muted-contrast", size === "normal" && "px-3", size === "compact" && "px-2", size === "small" && "px-2");
    const htmlType = derived(() => type === "password" ? "password" : "text");
    function focus() {
    }
    $$renderer2.push(`<div${attr_class(clsx(wrapperClass()))}>`);
    if (prefix) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`${stringify(affixClass)} border-r border-frame`)}>`);
      if (typeof prefix === "string") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span>${escape_html(prefix)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        prefix($$renderer2);
        $$renderer2.push(`<!---->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="relative flex h-full w-full items-center">`);
    if (icon) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="absolute left-3 text-muted-contrast">`);
      Icon$1($$renderer2, { icon, size: "5" });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <input${attributes(
      {
        type: htmlType(),
        class: clsx(inputClass),
        placeholder,
        disabled,
        value,
        ...props
      },
      void 0,
      void 0,
      void 0,
      4
    )}/> `);
    if (type === "password") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button type="button" class="absolute right-3 text-muted-contrast hover:text-canvas-contrast focus:outline-none cursor-pointer">`);
      Icon$1($$renderer2, {
        icon: defineIcon(Eye),
        size: "5"
      });
      $$renderer2.push(`<!----></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (suffix) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attr_class(`${stringify(affixClass)} border-l border-frame`)}>`);
      if (typeof suffix === "string") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span>${escape_html(suffix)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        suffix($$renderer2);
        $$renderer2.push(`<!---->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value, focus });
  });
}
export {
  Input as I
};
