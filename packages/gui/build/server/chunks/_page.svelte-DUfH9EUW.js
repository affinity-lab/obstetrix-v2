import { e as ensure_array_like, a as attr_class, j as stringify, d as escape_html } from './renderer-Dl7nK692.js';
import { a as api } from './tango-BLNraxd9.js';
import { B as BUILD_TEMPLATES, t as templateToConf } from './templates-ConeMLyY.js';
import { B as Button } from './Button-BLGydG4b.js';
import { I as Input } from './Input-CkXczDYh.js';
import '@atom-forge/tango-rpc';
import './bundle-mjs-xhk8uJeD.js';
import './Icon-CngImbf_.js';
import './Icon2-BONb4JT4.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let showCreate = false;
    let newName = "";
    let newRepoUrl = "";
    let newBranch = "main";
    let newPorts = "4";
    let selectedTpl = "";
    let creating = false;
    let createError = null;
    function cancelCreate() {
      showCreate = false;
      newName = "";
      newRepoUrl = "";
      newBranch = "main";
      newPorts = "4";
      selectedTpl = "";
      createError = null;
    }
    async function createProject() {
      createError = null;
      if (!/^[a-z0-9-]+$/.test(newName)) {
        createError = "name must be lowercase letters, numbers, and hyphens only";
        return;
      }
      if (!newRepoUrl.trim()) {
        createError = "repo URL is required";
        return;
      }
      creating = true;
      try {
        const { name: created } = await api.config.createProject.$command({
          name: newName.trim(),
          repoUrl: newRepoUrl.trim(),
          branch: newBranch.trim() || "main",
          ports: parseInt(newPorts) || 4
        });
        if (selectedTpl) {
          const tpl = BUILD_TEMPLATES.find((t) => t.id === selectedTpl);
          if (tpl) {
            const conf = templateToConf(tpl, newRepoUrl.trim(), newBranch.trim() || "main");
            const changes = {};
            for (const line of conf.split("\n")) {
              const eq = line.indexOf("=");
              if (eq > 0) changes[line.slice(0, eq)] = line.slice(eq + 1);
            }
            await api.config.setProjectConf.$command({ name: created, changes });
          }
        }
        location.href = `/settings/project/${created}`;
      } catch (e) {
        createError = String(e);
        creating = false;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex items-center justify-between mb-4"><span class="text-muted-contrast text-xs uppercase tracking-wide">projects</span> `);
      if (!showCreate) {
        $$renderer3.push("<!--[0-->");
        Button($$renderer3, {
          small: true,
          onclick: () => showCreate = true,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->new project`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      if (showCreate) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="bg-surface border border-frame rounded-lg px-4 py-4 flex flex-col gap-4 mb-4"><span class="text-canvas-contrast text-sm font-medium">new project</span> <div class="flex flex-col gap-1.5"><label class="text-muted-contrast text-xs">template (optional)</label> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"><!--[-->`);
        const each_array = ensure_array_like(BUILD_TEMPLATES);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let tpl = each_array[$$index];
          $$renderer3.push(`<button${attr_class(`text-left px-3 py-2 rounded-md border text-xs transition-colors ${stringify(selectedTpl === tpl.id ? "border-accent text-canvas-contrast bg-secondary" : "border-frame text-muted-contrast hover:text-canvas-contrast hover:border-accent/50 hover:bg-secondary/50")}`)}><div class="font-medium">${escape_html(tpl.label)}</div> <div class="text-xs opacity-70 mt-0.5">${escape_html(tpl.description)}</div></button>`);
        }
        $$renderer3.push(`<!--]--></div> `);
        if (selectedTpl) {
          $$renderer3.push("<!--[0-->");
          const tpl = BUILD_TEMPLATES.find((t) => t.id === selectedTpl);
          if (tpl) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<p class="text-muted-contrast text-xs mt-1">BUILD_CMD: <span class="font-mono text-canvas-contrast">${escape_html(tpl.buildCmd)}</span></p>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]-->`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="flex flex-col gap-1.5"><label class="text-muted-contrast text-xs">name <span class="text-red-500">*</span></label> `);
        Input($$renderer3, {
          placeholder: "my-app",
          monospace: true,
          compact: true,
          get value() {
            return newName;
          },
          set value($$value) {
            newName = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1.5"><label class="text-muted-contrast text-xs">repo URL <span class="text-red-500">*</span></label> `);
        Input($$renderer3, {
          placeholder: "https://github.com/org/repo",
          compact: true,
          get value() {
            return newRepoUrl;
          },
          set value($$value) {
            newRepoUrl = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1.5"><label class="text-muted-contrast text-xs">branch</label> `);
        Input($$renderer3, {
          placeholder: "main",
          monospace: true,
          compact: true,
          get value() {
            return newBranch;
          },
          set value($$value) {
            newBranch = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div> <div class="flex flex-col gap-1.5"><label class="text-muted-contrast text-xs">max instances (port count)</label> `);
        Input($$renderer3, {
          type: "integer",
          placeholder: "4",
          compact: true,
          get value() {
            return newPorts;
          },
          set value($$value) {
            newPorts = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div></div> `);
        if (createError) {
          $$renderer3.push("<!--[0-->");
          $$renderer3.push(`<p class="text-red-400 text-xs">${escape_html(createError)}</p>`);
        } else {
          $$renderer3.push("<!--[-1-->");
        }
        $$renderer3.push(`<!--]--> <div class="flex gap-2">`);
        Button($$renderer3, {
          small: true,
          onclick: createProject,
          loading: creating,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(creating ? "creating…" : "create")}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Button($$renderer3, {
          ghost: true,
          small: true,
          onclick: cancelCreate,
          disabled: creating,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->cancel`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<p class="text-muted-contrast text-sm">loading...</p>`);
      }
      $$renderer3.push(`<!--]-->`);
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
//# sourceMappingURL=_page.svelte-DUfH9EUW.js.map
