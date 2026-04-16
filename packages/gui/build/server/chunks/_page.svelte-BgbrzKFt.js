import { d as escape_html, e as ensure_array_like, a as attr_class, j as stringify, l as derived, m as store_get, u as unsubscribe_stores } from './renderer-Dl7nK692.js';
import { p as page } from './stores-CgOtgGmT.js';
import { B as Breadcrumb } from './Breadcrumb-CVXI2gpK.js';
import { B as Button } from './Button-BLGydG4b.js';
import './root-BkPoLMvS.js';
import './state.svelte-BT-IhQPS.js';
import './bundle-mjs-xhk8uJeD.js';
import './RenderSnippet-5kR9tmSM.js';
import './Icon-CngImbf_.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let lines = [];
    function formatTs(iso) {
      return new Date(iso).toLocaleTimeString(void 0, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
    $$renderer2.push(`<div class="flex flex-col gap-3 h-full"><div class="flex items-center gap-3 flex-wrap">`);
    Breadcrumb($$renderer2, {
      items: [
        { label: "dashboard", href: "/" },
        { label: name(), href: `/project/${name()}` },
        { label: "live logs" }
      ]
    });
    $$renderer2.push(`<!----> <span class="flex-1"></span> `);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="inline-flex items-center gap-1 text-xs text-red-400"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>reconnecting…</span>`);
    }
    $$renderer2.push(`<!--]--> <span class="text-muted-contrast text-xs">${escape_html(lines.length)} line${escape_html(lines.length === 1 ? "" : "s")}</span> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    Button($$renderer2, {
      micro: true,
      ghost: true,
      onclick: () => lines = [],
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->clear`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> <div class="bg-surface border border-frame rounded-lg font-mono text-xs h-[75vh] overflow-y-auto p-4">`);
    if (lines.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-muted-contrast">waiting for log output…</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(lines);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let line = each_array[$$index];
        $$renderer2.push(`<div${attr_class(`flex gap-2 leading-5 ${stringify(line.kind === "phase" ? "text-accent" : line.kind === "error" ? "text-red-400" : line.kind === "meta" ? "text-blue-400" : "text-canvas-contrast")}`)}><span class="text-muted-contrast select-none shrink-0">[${escape_html(formatTs(line.ts))}]</span> <span class="whitespace-pre-wrap break-all">${escape_html(line.text)}</span></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BgbrzKFt.js.map
