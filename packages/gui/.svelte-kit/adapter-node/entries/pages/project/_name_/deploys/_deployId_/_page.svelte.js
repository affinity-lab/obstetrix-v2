import { f as derived, g as store_get, u as unsubscribe_stores } from "../../../../../../chunks/renderer.js";
import { p as page } from "../../../../../../chunks/stores.js";
import "../../../../../../chunks/tango.js";
import { B as Breadcrumb } from "../../../../../../chunks/Breadcrumb.js";
import { g as getToastManager } from "../../../../../../chunks/toast-manager.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    const deployId = derived(() => store_get($$store_subs ??= {}, "$page", page).params.deployId);
    getToastManager();
    $$renderer2.push(`<div class="flex flex-col gap-4 max-w-2xl"><div class="flex items-center gap-2 flex-wrap">`);
    Breadcrumb($$renderer2, {
      items: [
        { label: "dashboard", href: "/" },
        { label: name(), href: `/project/${name()}` },
        { label: "deploys", href: `/project/${name()}/deploys` },
        {
          label: decodeURIComponent(deployId())
        }
      ]
    });
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-c text-sm">loading...</p>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
