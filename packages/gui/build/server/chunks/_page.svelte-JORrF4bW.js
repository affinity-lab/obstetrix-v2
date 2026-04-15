import { d as escape_html } from './renderer-Dl7nK692.js';
import { a as api } from './tango-BLNraxd9.js';
import { B as Breadcrumb } from './Breadcrumb-CVXI2gpK.js';
import { S as Switch, T as Textarea } from './Textarea-DB5XRuPX.js';
import { B as Button } from './Button-BLGydG4b.js';
import { g as getToastManager } from './toast-manager.svelte-B4mNv2sJ.js';
import '@atom-forge/tango-rpc';
import './bundle-mjs-xhk8uJeD.js';
import './RenderSnippet-5kR9tmSM.js';
import './Icon-CngImbf_.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let confText = "";
    let masked = true;
    let saving = false;
    const toast = getToastManager();
    async function save() {
      saving = true;
      try {
        const changes = {};
        for (const line of confText.split("\n")) {
          const eq = line.indexOf("=");
          if (eq > 0) changes[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
        }
        for (const k of Object.keys(changes)) {
          if (changes[k].includes("****")) delete changes[k];
        }
        await api.config.setMainConf.$command({ changes });
        toast.show("Saved", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        saving = false;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col gap-4 max-w-2xl">`);
      Breadcrumb($$renderer3, {
        items: [
          { label: "settings", href: "/settings" },
          { label: "obstetrix.conf" }
        ]
      });
      $$renderer3.push(`<!----> <p class="text-muted-c text-xs">All settings including <code class="font-mono">GITHUB_TOKEN</code> and <code class="font-mono">PORT.*</code> assignments. Values for keys containing
    TOKEN / SECRET / KEY are masked by default.</p> `);
      Switch($$renderer3, {
        label: "mask secret values",
        get value() {
          return masked;
        },
        set value($$value) {
          masked = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      Textarea($$renderer3, {
        monospace: true,
        rows: 24,
        get value() {
          return confText;
        },
        set value($$value) {
          confText = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="flex gap-2">`);
      Button($$renderer3, {
        small: true,
        onclick: save,
        loading: saving,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(saving ? "saving..." : "save")}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-JORrF4bW.js.map
