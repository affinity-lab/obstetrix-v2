import { e as ensure_array_like, c as escape_html, d as attr, b as stringify } from "../../../chunks/renderer.js";
import { a as api } from "../../../chunks/tango.js";
import { B as Button } from "../../../chunks/Button.js";
import { g as getToastManager } from "../../../chunks/toast-manager.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let disk = [];
    let ports = [];
    let reloading = false;
    const toast = getToastManager();
    async function reloadConfig() {
      reloading = true;
      try {
        const r = await api.config.reload.$command(void 0);
        toast.show(`Reloaded ${r.reloaded} project config(s)`, { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        reloading = false;
      }
    }
    $$renderer2.push(`<div class="flex flex-col gap-6 max-w-2xl"><h1 class="text-canvas-contrast text-lg font-semibold">settings</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (disk.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="px-4 py-3 border-b border-frame"><span class="text-muted-contrast text-xs uppercase tracking-wide">disk usage</span></div> <div class="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 text-xs"><!--[-->`);
      const each_array = ensure_array_like(disk);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let d = each_array[$$index];
        $$renderer2.push(`<span class="text-muted-contrast">${escape_html(d.label)}</span> <span class="font-mono text-canvas-contrast">${escape_html(d.usedGb.toFixed(1))} / ${escape_html(d.totalGb.toFixed(1))} GB</span> <span class="text-muted-contrast">${escape_html(d.usedPct.toFixed(0))}%</span>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (ports.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="px-4 py-3 border-b border-frame"><span class="text-muted-contrast text-xs uppercase tracking-wide">port allocations</span></div> <!--[-->`);
      const each_array_1 = ensure_array_like(ports);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let p = each_array_1[$$index_1];
        $$renderer2.push(`<div class="px-4 py-2.5 border-b border-frame last:border-0 flex items-center justify-between text-sm"><span class="text-canvas-contrast font-mono text-xs">${escape_html(p.name)}</span> <span class="text-muted-contrast text-xs">base ${escape_html(p.base)} · ${escape_html(p.count)} port${escape_html(p.count === 1 ? "" : "s")} ·
            ${escape_html(p.base)}–${escape_html(p.base + p.count - 1)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="px-4 py-3 border-b border-frame"><span class="text-muted-contrast text-xs uppercase tracking-wide">project configs</span></div> <!--[-->`);
    const each_array_2 = ensure_array_like(projects);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let project = each_array_2[$$index_2];
      $$renderer2.push(`<a${attr("href", `/settings/project/${stringify(project.name)}`)} class="flex items-center justify-between px-4 py-3 border-b border-frame last:border-0 hover:bg-secondary/50 transition-colors text-sm"><span class="text-canvas-contrast font-mono text-xs">${escape_html(project.name)}</span> <span class="text-muted-contrast text-xs">edit .conf / .env / .npmrc →</span></a>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (projects.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-contrast text-xs px-4 py-3">no projects configured</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="bg-surface border border-frame rounded-lg overflow-hidden"><a href="/settings/nginx" class="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-sm"><span class="text-canvas-contrast">nginx</span> <span class="text-muted-contrast text-xs">manage sites-available, enable/disable, reload →</span></a></div> <div class="flex gap-3 flex-wrap">`);
    Button($$renderer2, {
      small: true,
      onclick: reloadConfig,
      loading: reloading,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(reloading ? "reloading..." : "reload configs")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      small: true,
      ghost: true,
      onclick: () => location.href = "/settings/secrets",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->edit obstetrix.conf`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div>`);
  });
}
export {
  _page as default
};
