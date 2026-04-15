import { t as attributes, o as clsx, l as derived } from './renderer-Dl7nK692.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';
import { I as Icon } from './Icon-CngImbf_.js';

function Chip($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      color = "base",
      icon,
      children,
      start,
      end,
      class: classes,
      $$slots,
      $$events,
      ...rest
    } = $$props;
    const colorClass = derived(() => ({
      base: "bg-secondary text-secondary-contrast",
      green: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      red: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
    })[color]);
    $$renderer2.push(`<span${attributes({
      class: clsx(twMerge("inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium", colorClass(), classes)),
      ...rest
    })}>`);
    if (start) {
      $$renderer2.push("<!--[0-->");
      start($$renderer2);
      $$renderer2.push(`<!---->`);
    } else if (icon) {
      $$renderer2.push("<!--[1-->");
      Icon($$renderer2, { icon, size: "3" });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    children($$renderer2);
    $$renderer2.push(`<!----> `);
    if (end) {
      $$renderer2.push("<!--[0-->");
      end($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></span>`);
  });
}

export { Chip as C };
//# sourceMappingURL=Chip-BMXn76o7.js.map
