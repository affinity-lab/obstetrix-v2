import { l as derived, m as store_get, u as unsubscribe_stores } from './renderer-Dl7nK692.js';
import { p as page } from './stores-CgOtgGmT.js';
import './tango-BLNraxd9.js';
import { B as Breadcrumb } from './Breadcrumb-CVXI2gpK.js';
import { C as Chip } from './Chip-BMXn76o7.js';
import { g as getToastManager } from './toast-manager.svelte-B4mNv2sJ.js';
import './root-BkPoLMvS.js';
import './state.svelte-BT-IhQPS.js';
import '@atom-forge/tango-rpc';
import './bundle-mjs-xhk8uJeD.js';
import './RenderSnippet-5kR9tmSM.js';
import './Icon-CngImbf_.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const siteName = derived(() => decodeURIComponent(store_get($$store_subs ??= {}, "$page", page).params.site));
    let content = "";
    let original = "";
    let dirty = derived(() => content !== original);
    getToastManager();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col gap-4 max-w-3xl"><div class="flex items-center gap-2 flex-wrap">`);
      Breadcrumb($$renderer3, {
        items: [
          { label: "settings", href: "/settings" },
          { label: "nginx", href: "/settings/nginx" },
          { label: siteName() }
        ]
      });
      $$renderer3.push(`<!----> `);
      if (dirty()) {
        $$renderer3.push("<!--[0-->");
        Chip($$renderer3, {
          color: "blue",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->unsaved`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<p class="text-muted-c text-sm">loading...</p>`);
      }
      $$renderer3.push(`<!--]--></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CzZFPxX_.js.map
