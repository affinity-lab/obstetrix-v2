import { x as ssr_context, l as derived, m as store_get, d as escape_html, e as ensure_array_like, a as attr_class, o as clsx, u as unsubscribe_stores } from './renderer-Dl7nK692.js';
import { p as page } from './stores-CgOtgGmT.js';
import { a as api } from './tango-BLNraxd9.js';
import { B as Breadcrumb } from './Breadcrumb-CVXI2gpK.js';
import { B as Button } from './Button-BLGydG4b.js';
import './root-BkPoLMvS.js';
import './state.svelte-BT-IhQPS.js';
import '@atom-forge/tango-rpc';
import './bundle-mjs-xhk8uJeD.js';
import './RenderSnippet-5kR9tmSM.js';
import './Icon-CngImbf_.js';

function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let output = "";
    let loading = true;
    let autoRefresh = false;
    let lines = 300;
    let intervalId = null;
    async function load() {
      loading = true;
      try {
        const res = await api.journal.tail.$query({ name: name(), lines });
        output = res?.output ?? "(no output)";
      } catch (e) {
        output = `error: ${e}`;
      } finally {
        loading = false;
      }
    }
    function toggleAutoRefresh() {
      autoRefresh = !autoRefresh;
      if (autoRefresh) {
        intervalId = setInterval(load, 5e3);
      } else {
        if (intervalId !== null) clearInterval(intervalId);
        intervalId = null;
      }
    }
    function lineClass(line) {
      const l = line.toLowerCase();
      if (l.includes("error") || l.includes("fatal") || l.includes("panic")) return "text-red-400";
      if (l.includes("warn")) return "text-yellow-400";
      return "text-control-c";
    }
    onDestroy(() => {
      if (intervalId !== null) clearInterval(intervalId);
    });
    $$renderer2.push(`<div class="flex flex-col gap-4 max-w-4xl"><div class="flex items-center gap-2 flex-wrap">`);
    Breadcrumb($$renderer2, {
      items: [
        { label: "dashboard", href: "/" },
        { label: name(), href: `/project/${name()}` },
        { label: "journal" }
      ]
    });
    $$renderer2.push(`<!----> <span class="flex-1"></span> `);
    $$renderer2.select(
      {
        value: lines,
        onchange: load,
        class: "bg-control border border-base-b rounded-md h-8 text-xs text-control-c px-2 outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: 100 }, ($$renderer4) => {
          $$renderer4.push(`last 100`);
        });
        $$renderer3.option({ value: 300 }, ($$renderer4) => {
          $$renderer4.push(`last 300`);
        });
        $$renderer3.option({ value: 500 }, ($$renderer4) => {
          $$renderer4.push(`last 500`);
        });
        $$renderer3.option({ value: 1e3 }, ($$renderer4) => {
          $$renderer4.push(`last 1000`);
        });
      }
    );
    $$renderer2.push(` `);
    Button($$renderer2, {
      ghost: true,
      small: true,
      onclick: load,
      disabled: loading,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(loading ? "loading…" : "refresh")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      ghost: true,
      small: true,
      onclick: toggleAutoRefresh,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(autoRefresh ? "stop auto" : "auto (5s)")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (loading && !output) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-c text-sm">loading…</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="bg-raised border border-base-b rounded-lg font-mono text-xs p-4 overflow-auto max-h-[80vh] whitespace-pre-wrap"><!--[-->`);
      const each_array = ensure_array_like(output.split("\n"));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let line = each_array[$$index];
        if (line) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div${attr_class(clsx(lineClass(line)))}>${escape_html(line)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BvNDKTvk.js.map
