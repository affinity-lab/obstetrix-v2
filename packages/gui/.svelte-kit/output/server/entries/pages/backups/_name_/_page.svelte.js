import { c as escape_html, e as ensure_array_like, d as attr, b as stringify, f as derived, g as store_get, u as unsubscribe_stores } from "../../../../chunks/renderer.js";
import { p as page } from "../../../../chunks/stores.js";
import { a as api } from "../../../../chunks/tango.js";
import { B as Breadcrumb } from "../../../../chunks/Breadcrumb.js";
import { B as Button } from "../../../../chunks/Button.js";
import { E as EmptyState, A as Archive } from "../../../../chunks/archive.js";
import { g as getToastManager } from "../../../../chunks/toast-manager.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let backups = [];
    let running = false;
    const toast = getToastManager();
    async function runBackup() {
      running = true;
      try {
        const result = await api.backup.run.$command({ name: name() });
        backups = [result, ...backups];
        toast.show("Backup created", { type: "success" });
      } catch (e) {
        toast.show(`Backup failed: ${e}`, { type: "error" });
      } finally {
        running = false;
      }
    }
    function fmt(bytes) {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    $$renderer2.push(`<div class="flex flex-col gap-4 max-w-2xl"><div class="flex items-center justify-between">`);
    Breadcrumb($$renderer2, {
      items: [{ label: "backups", href: "/backups" }, { label: name() }]
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      small: true,
      onclick: runBackup,
      loading: running,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(running ? "running..." : "backup now")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (backups.length === 0) {
      $$renderer2.push("<!--[0-->");
      EmptyState($$renderer2, {
        icon: Archive,
        title: "No backups yet",
        description: "Click backup now to create the first backup"
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="bg-surface border border-frame rounded-lg overflow-hidden"><!--[-->`);
      const each_array = ensure_array_like(backups);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let b = each_array[$$index];
        $$renderer2.push(`<div class="flex items-center gap-3 px-4 py-3 border-b border-frame last:border-0 text-sm"><span class="text-muted-contrast text-xs flex-1">${escape_html(b.createdAt)}</span> <span class="font-mono text-xs text-muted-contrast">${escape_html(fmt(b.sizeBytes))}</span> <a${attr("href", `/api/backup/download?path=${stringify(encodeURIComponent(b.path))}`)} class="text-muted-contrast hover:text-canvas-contrast text-xs" download="">↓ download</a></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
