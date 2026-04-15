import { e as ensure_array_like, k as attr, j as stringify, d as escape_html } from './renderer-Dl7nK692.js';
import { a as api } from './tango-BLNraxd9.js';
import { g as getToastManager } from './toast-manager.svelte-B4mNv2sJ.js';
import { B as Button } from './Button-BLGydG4b.js';
import { E as EmptyState, A as Archive } from './archive-CX0SI3gq.js';
import '@atom-forge/tango-rpc';
import './bundle-mjs-xhk8uJeD.js';
import './Icon-CngImbf_.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let backups = {};
    let running = {};
    const toast = getToastManager();
    async function runBackup(name) {
      running = { ...running, [name]: true };
      try {
        const result = await api.backup.run.$command({ name });
        backups = { ...backups, [name]: [result, ...backups[name] ?? []] };
        toast.show(`Backup created for ${name}`, { type: "success" });
      } catch (e) {
        toast.show(`Backup failed: ${e}`, { type: "error" });
      } finally {
        running = { ...running, [name]: false };
      }
    }
    async function runSystem() {
      running = { ...running, __system: true };
      try {
        await api.backup.runSystem.$command(void 0);
        toast.show("System backup started", { type: "success" });
      } catch (e) {
        toast.show(`Backup failed: ${e}`, { type: "error" });
      } finally {
        running = { ...running, __system: false };
      }
    }
    function fmt(bytes) {
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }
    $$renderer2.push(`<div class="flex flex-col gap-6"><div class="flex items-center justify-between"><h1 class="text-canvas-contrast text-lg font-semibold">backups</h1> `);
    Button($$renderer2, {
      small: true,
      secondary: true,
      onclick: runSystem,
      loading: running["__system"],
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(running["__system"] ? "running..." : "system backup")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    if (projects.length === 0) {
      $$renderer2.push("<!--[0-->");
      EmptyState($$renderer2, {
        icon: Archive,
        title: "No projects",
        description: "Create a project to start taking backups"
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(projects);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let project = each_array[$$index_1];
        $$renderer2.push(`<div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="flex items-center justify-between px-4 py-3 border-b border-frame"><a${attr("href", `/backups/${stringify(project.name)}`)} class="text-canvas-contrast text-sm font-medium hover:underline">${escape_html(project.name)}</a> `);
        Button($$renderer2, {
          micro: true,
          onclick: () => runBackup(project.name),
          loading: running[project.name],
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->${escape_html(running[project.name] ? "running..." : "backup now")}`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div> `);
        if ((backups[project.name] ?? []).length === 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="text-muted-contrast text-xs px-4 py-3">no backups yet</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<!--[-->`);
          const each_array_1 = ensure_array_like((backups[project.name] ?? []).slice(0, 3));
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let b = each_array_1[$$index];
            $$renderer2.push(`<div class="flex items-center gap-3 px-4 py-2.5 border-b border-frame last:border-0 text-xs"><span class="text-muted-contrast flex-1">${escape_html(b.createdAt)}</span> <span class="text-muted-contrast font-mono">${escape_html(fmt(b.sizeBytes))}</span> <a${attr("href", `/api/backup/download?path=${stringify(encodeURIComponent(b.path))}`)} class="text-muted-contrast hover:text-canvas-contrast" download="">↓ download</a></div>`);
          }
          $$renderer2.push(`<!--]--> `);
          if ((backups[project.name] ?? []).length > 3) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<a${attr("href", `/backups/${stringify(project.name)}`)} class="block px-4 py-2 text-muted-contrast text-xs hover:text-canvas-contrast hover:bg-secondary/50 transition-colors">view all ${escape_html(backups[project.name].length)} backups →</a>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-mtzUCdRV.js.map
