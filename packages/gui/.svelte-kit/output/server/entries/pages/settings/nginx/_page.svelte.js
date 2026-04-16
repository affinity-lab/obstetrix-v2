import { c as escape_html, a as attr_class, b as stringify } from "../../../../chunks/renderer.js";
import { a as api } from "../../../../chunks/tango.js";
import { B as Breadcrumb } from "../../../../chunks/Breadcrumb.js";
import { B as Button } from "../../../../chunks/Button.js";
import { g as getToastManager } from "../../../../chunks/toast-manager.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let testing = false;
    let reloading = false;
    let testOutput = null;
    const toast = getToastManager();
    async function testConfig() {
      testing = true;
      testOutput = null;
      try {
        const res = await api.nginx.test.$query(void 0);
        testOutput = {
          text: res.output || (res.ok ? "syntax ok" : "test failed"),
          ok: res.ok
        };
      } catch (e) {
        testOutput = { text: String(e), ok: false };
      } finally {
        testing = false;
      }
    }
    async function reloadNginx() {
      reloading = true;
      testOutput = null;
      try {
        const res = await api.nginx.reload.$command(void 0);
        toast.show(res.output || "nginx reloaded", { type: "success" });
      } catch (e) {
        toast.show(String(e), { type: "error" });
      } finally {
        reloading = false;
      }
    }
    $$renderer2.push(`<div class="flex flex-col gap-6 max-w-2xl">`);
    Breadcrumb($$renderer2, {
      items: [{ label: "settings", href: "/settings" }, { label: "nginx" }]
    });
    $$renderer2.push(`<!----> <div class="flex gap-2 flex-wrap">`);
    Button($$renderer2, {
      small: true,
      onclick: testConfig,
      loading: testing,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(testing ? "testing…" : "test config")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      small: true,
      secondary: true,
      onclick: reloadNginx,
      loading: reloading,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(reloading ? "reloading…" : "reload nginx")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (testOutput) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<pre${attr_class(`text-xs rounded-lg px-4 py-3 font-mono whitespace-pre-wrap border border-frame ${stringify(testOutput.ok ? "bg-surface text-green-400" : "bg-surface text-red-400")}`)}>${escape_html(testOutput.text)}</pre>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-contrast text-sm">loading...</p>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
