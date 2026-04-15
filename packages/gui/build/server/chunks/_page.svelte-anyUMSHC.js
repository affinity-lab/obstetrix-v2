import { l as derived, m as store_get, r as run, b as setContext, d as escape_html, u as unsubscribe_stores, g as getContext, a as attr_class, o as clsx, t as attributes, e as ensure_array_like, j as stringify } from './renderer-Dl7nK692.js';
import { p as page } from './stores-CgOtgGmT.js';
import { a as api } from './tango-BLNraxd9.js';
import { B as BUILD_TEMPLATES } from './templates-ConeMLyY.js';
import { B as Breadcrumb } from './Breadcrumb-CVXI2gpK.js';
import { B as Button } from './Button-BLGydG4b.js';
import { S as Switch, T as Textarea } from './Textarea-DB5XRuPX.js';
import { I as Input } from './Input-CkXczDYh.js';
import { t as twMerge } from './bundle-mjs-xhk8uJeD.js';
import { I as Icon } from './Icon-CngImbf_.js';
import { g as getToastManager } from './toast-manager.svelte-B4mNv2sJ.js';
import './root-BkPoLMvS.js';
import './state.svelte-BT-IhQPS.js';
import '@atom-forge/tango-rpc';
import './RenderSnippet-5kR9tmSM.js';
import './Icon2-BONb4JT4.js';

function Tab($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id, icon, children } = $$props;
    const context = getContext("tabs-context");
    const isLine = context.variant === "line";
    const isActive = derived(() => context.isActive(id));
    const classes = derived(() => twMerge("flex items-center gap-2 transition-all duration-150 cursor-pointer", isLine && "px-4 py-2 -mb-px text-sm font-medium border-b-2", !isLine && "px-3 py-1 rounded-control text-sm", isLine && isActive() && "border-accent text-canvas-contrast", isLine && !isActive() && "border-transparent text-muted-contrast hover:text-canvas-contrast", !isLine && isActive() && "bg-surface text-surface-contrast shadow-sm", !isLine && !isActive() && "text-muted-contrast hover:bg-secondary/50"));
    $$renderer2.push(`<button${attr_class(clsx(classes()))}>`);
    if (icon) {
      $$renderer2.push("<!--[0-->");
      Icon($$renderer2, { icon, size: "5" });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    children($$renderer2);
    $$renderer2.push(`<!----></button>`);
  });
}
function TabList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children, class: classes } = $$props;
    const context = getContext("tabs-context");
    $$renderer2.push(`<div${attr_class(clsx(twMerge("flex", context.variant === "line" && "border-b border-frame", context.variant === "button" && "gap-1 bg-secondary p-1 rounded-surface", classes)))}>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function TabPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id, children, $$slots, $$events, ...props } = $$props;
    const context = getContext("tabs-context");
    const isActive = derived(() => context.isActive(id));
    if (isActive()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div${attributes({ ...props })}>`);
      children($$renderer2);
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function Tabs($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      initialTabId,
      children,
      onTabChange,
      variant: _variant = "line"
    } = $$props;
    const variant = run(() => _variant);
    let activeTabId = run(() => initialTabId);
    setContext("tabs-context", {
      isActive: (id) => activeTabId === id,
      selectTab: (id) => {
        activeTabId = id;
        if (onTabChange) {
          onTabChange(id);
        }
      },
      variant
    });
    $$renderer2.push(`<div>`);
    children($$renderer2);
    $$renderer2.push(`<!----></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let confText = "";
    let envText = "";
    let npmrcText = "";
    let saving = false;
    let syncing = false;
    const toast = getToastManager();
    let deployLoaded = false;
    let buildCmd = "";
    let branch = "main";
    let healthUrl = "";
    let healthTimeout = "60";
    let rollbackOnFail = true;
    let autoDeploy = true;
    let defaultInstances = "1";
    let persistentDirs = "";
    let confLoaded = false;
    let envLoaded = false;
    let npmrcLoaded = false;
    let showTemplates = false;
    let showDelete = false;
    let removeData = false;
    let confirmName = "";
    let deleting = false;
    function parseConf(text) {
      const m = {};
      for (const line of text.split("\n")) {
        const eq = line.indexOf("=");
        if (eq > 0) m[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
      return m;
    }
    async function loadConf() {
      return await api.config.getProjectConf.$query({ name: name() });
    }
    function applyConfToDeployFields(conf) {
      buildCmd = conf["BUILD_CMD"] ?? "";
      branch = conf["BRANCH"] ?? "main";
      healthUrl = conf["HEALTH_CHECK_URL"] ?? "";
      healthTimeout = conf["HEALTH_TIMEOUT"] ?? "60";
      rollbackOnFail = (conf["ROLLBACK_ON_FAIL"] ?? "true") !== "false";
      autoDeploy = (conf["AUTO_DEPLOY"] ?? "true") !== "false";
      defaultInstances = conf["DEFAULT_INSTANCES"] ?? "1";
      persistentDirs = conf["PERSISTENT_DIRS"] ?? "";
    }
    async function onTabChange(id) {
      if (id === "deploy" && !deployLoaded) {
        const conf = await loadConf();
        applyConfToDeployFields(conf);
        deployLoaded = true;
      }
      if (id === "conf" && !confLoaded) {
        const conf = await loadConf();
        confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join("\n");
        confLoaded = true;
      }
      if (id === "env" && !envLoaded) {
        const res = await api.config.getEnv.$query({ name: name() });
        envText = res.content;
        envLoaded = true;
      }
      if (id === "npmrc" && !npmrcLoaded) {
        const res = await api.config.getNpmrc.$query({ name: name() });
        npmrcText = res.content;
        npmrcLoaded = true;
      }
    }
    async function saveDeploy() {
      saving = true;
      try {
        const changes = {
          BUILD_CMD: buildCmd,
          BRANCH: branch,
          HEALTH_CHECK_URL: healthUrl,
          HEALTH_TIMEOUT: healthTimeout,
          ROLLBACK_ON_FAIL: rollbackOnFail ? "true" : "false",
          AUTO_DEPLOY: autoDeploy ? "true" : "false",
          DEFAULT_INSTANCES: defaultInstances,
          PERSISTENT_DIRS: persistentDirs
        };
        await api.config.setProjectConf.$command({ name: name(), changes });
        confLoaded = false;
        toast.show("Saved — changes apply on next deploy", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        saving = false;
      }
    }
    async function saveConf() {
      saving = true;
      try {
        const changes = parseConf(confText);
        await api.config.setProjectConf.$command({ name: name(), changes });
        deployLoaded = false;
        toast.show("Saved — changes apply on next deploy", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        saving = false;
      }
    }
    async function saveEnv() {
      saving = true;
      try {
        await api.config.setEnv.$command({ name: name(), content: envText });
        toast.show("Saved", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        saving = false;
      }
    }
    async function saveNpmrc() {
      saving = true;
      try {
        await api.config.setNpmrc.$command({ name: name(), content: npmrcText });
        toast.show("Saved", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        saving = false;
      }
    }
    async function syncEnvNow() {
      syncing = true;
      try {
        await api.config.syncEnv.$command({ name: name() });
        toast.show("Env synced and services restarted", { type: "success" });
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
      } finally {
        syncing = false;
      }
    }
    async function deleteProject() {
      deleting = true;
      try {
        await api.config.deleteProject.$command({ name: name(), removeData });
        location.href = "/";
      } catch (e) {
        toast.show(`Error: ${e}`, { type: "error" });
        deleting = false;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col gap-4 max-w-2xl">`);
      Breadcrumb($$renderer3, {
        items: [{ label: "settings", href: "/settings" }, { label: name() }]
      });
      $$renderer3.push(`<!----> `);
      Tabs($$renderer3, {
        initialTabId: "deploy",
        onTabChange,
        children: ($$renderer4) => {
          TabList($$renderer4, {
            children: ($$renderer5) => {
              Tab($$renderer5, {
                id: "deploy",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->deploy`);
                }
              });
              $$renderer5.push(`<!----> `);
              Tab($$renderer5, {
                id: "conf",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->project.conf`);
                }
              });
              $$renderer5.push(`<!----> `);
              Tab($$renderer5, {
                id: "env",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->.env`);
                }
              });
              $$renderer5.push(`<!----> `);
              Tab($$renderer5, {
                id: "npmrc",
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->.npmrc`);
                }
              });
              $$renderer5.push(`<!---->`);
            }
          });
          $$renderer4.push(`<!----> `);
          TabPanel($$renderer4, {
            id: "deploy",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="flex flex-col gap-4 pt-4"><div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">build command <span class="normal-case font-normal ml-1 opacity-70">— runs in /obstetrix-projects/_work/${escape_html(name())}/</span></label> `);
              Textarea($$renderer5, {
                placeholder: "bun install && bun run build",
                monospace: true,
                rows: 4,
                get value() {
                  return buildCmd;
                },
                set value($$value) {
                  buildCmd = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <p class="text-muted-c text-xs">Use <span class="font-mono">&amp;&amp;</span> to chain commands.
            Port is available as <span class="font-mono">$PORT</span> at runtime (not during build).</p></div> `);
              if (showTemplates) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-2"><!--[-->`);
                const each_array = ensure_array_like(BUILD_TEMPLATES);
                for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
                  let tpl = each_array[$$index];
                  $$renderer5.push(`<button class="text-left px-3 py-2 rounded-md border border-base-b text-xs text-muted-c hover:text-control-c hover:border-accent/50 hover:bg-secondary/50 transition-colors"><div class="font-medium">${escape_html(tpl.label)}</div> <div class="opacity-70 mt-0.5 font-mono">${escape_html(tpl.buildCmd.slice(0, 32))}${escape_html(tpl.buildCmd.length > 32 ? "…" : "")}</div></button>`);
                }
                $$renderer5.push(`<!--]--></div> `);
                Button($$renderer5, {
                  ghost: true,
                  small: true,
                  onclick: () => showTemplates = false,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->cancel`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              } else {
                $$renderer5.push("<!--[-1-->");
                Button($$renderer5, {
                  ghost: true,
                  small: true,
                  onclick: () => showTemplates = true,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->load template…`);
                  },
                  $$slots: { default: true }
                });
              }
              $$renderer5.push(`<!--]--> <hr class="border-base-b"/> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">branch</label> `);
              Input($$renderer5, {
                placeholder: "main",
                monospace: true,
                compact: true,
                get value() {
                  return branch;
                },
                set value($$value) {
                  branch = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----></div> <div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">persistent dirs</label> `);
              Input($$renderer5, {
                placeholder: "uploads,data",
                monospace: true,
                compact: true,
                get value() {
                  return persistentDirs;
                },
                set value($$value) {
                  persistentDirs = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <p class="text-muted-c text-xs">comma-separated, relative to app dir — survive all deploys</p></div></div> <hr class="border-base-b"/> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">health check URL</label> `);
              Input($$renderer5, {
                placeholder: "http://127.0.0.1:$PORT/health",
                monospace: true,
                compact: true,
                get value() {
                  return healthUrl;
                },
                set value($$value) {
                  healthUrl = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <p class="text-muted-c text-xs">must return 2xx after each instance restart</p></div> <div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">health timeout (seconds)</label> `);
              Input($$renderer5, {
                type: "integer",
                placeholder: "60",
                compact: true,
                get value() {
                  return healthTimeout;
                },
                set value($$value) {
                  healthTimeout = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----></div></div> <hr class="border-base-b"/> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="flex flex-col gap-1.5"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">default instances</label> `);
              Input($$renderer5, {
                type: "integer",
                placeholder: "1",
                compact: true,
                get value() {
                  return defaultInstances;
                },
                set value($$value) {
                  defaultInstances = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <p class="text-muted-c text-xs">how many instances start on first deploy</p></div> <div class="flex flex-col gap-3"><label class="text-muted-c text-xs font-medium uppercase tracking-wide">behaviour</label> `);
              Switch($$renderer5, {
                label: {
                  on: "auto-rollback on failure",
                  off: "no rollback on failure"
                },
                get value() {
                  return rollbackOnFail;
                },
                set value($$value) {
                  rollbackOnFail = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> `);
              Switch($$renderer5, {
                label: { on: "auto-deploy new commits", off: "manual deploy only" },
                get value() {
                  return autoDeploy;
                },
                set value($$value) {
                  autoDeploy = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----></div></div> <div class="flex gap-2">`);
              Button($$renderer5, {
                small: true,
                onclick: saveDeploy,
                loading: saving,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(saving ? "saving…" : "save")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          TabPanel($$renderer4, {
            id: "conf",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="flex flex-col gap-3 pt-4">`);
              Textarea($$renderer5, {
                monospace: true,
                rows: 16,
                get value() {
                  return confText;
                },
                set value($$value) {
                  confText = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> `);
              if (showTemplates) {
                $$renderer5.push("<!--[0-->");
                $$renderer5.push(`<div class="grid grid-cols-2 sm:grid-cols-3 gap-2"><!--[-->`);
                const each_array_1 = ensure_array_like(BUILD_TEMPLATES);
                for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
                  let tpl = each_array_1[$$index_1];
                  $$renderer5.push(`<button class="text-left px-3 py-2 rounded-md border border-base-b text-xs text-muted-c hover:text-control-c hover:border-accent/50 hover:bg-secondary/50 transition-colors"><div class="font-medium">${escape_html(tpl.label)}</div> <div class="opacity-70 mt-0.5 font-mono">${escape_html(tpl.buildCmd.slice(0, 30))}${escape_html(tpl.buildCmd.length > 30 ? "…" : "")}</div></button>`);
                }
                $$renderer5.push(`<!--]--></div> `);
                Button($$renderer5, {
                  ghost: true,
                  small: true,
                  onclick: () => showTemplates = false,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->cancel`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!---->`);
              } else {
                $$renderer5.push("<!--[-1-->");
                $$renderer5.push(`<div class="flex gap-2">`);
                Button($$renderer5, {
                  small: true,
                  onclick: saveConf,
                  loading: saving,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->${escape_html(saving ? "saving..." : "save")}`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----> `);
                Button($$renderer5, {
                  ghost: true,
                  small: true,
                  onclick: () => showTemplates = true,
                  children: ($$renderer6) => {
                    $$renderer6.push(`<!---->load template…`);
                  },
                  $$slots: { default: true }
                });
                $$renderer5.push(`<!----></div>`);
              }
              $$renderer5.push(`<!--]--></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          TabPanel($$renderer4, {
            id: "env",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="flex flex-col gap-3 pt-4">`);
              Textarea($$renderer5, {
                placeholder: `NODE_ENV=production DATABASE_URL=$${stringify(DATABASE_URL)}`,
                monospace: true,
                rows: 16,
                get value() {
                  return envText;
                },
                set value($$value) {
                  envText = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <p class="text-muted-c text-xs">Use <span class="font-mono">\${VAR}</span> to substitute values from <span class="font-mono">obstetrix.conf</span> at deploy time.</p> <div class="flex gap-2">`);
              Button($$renderer5, {
                small: true,
                onclick: saveEnv,
                loading: saving,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(saving ? "saving..." : "save")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----> `);
              Button($$renderer5, {
                small: true,
                secondary: true,
                onclick: syncEnvNow,
                loading: syncing,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(syncing ? "syncing..." : "sync now")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          TabPanel($$renderer4, {
            id: "npmrc",
            children: ($$renderer5) => {
              $$renderer5.push(`<div class="flex flex-col gap-3 pt-4">`);
              Textarea($$renderer5, {
                placeholder: "frozen-lockfile=true",
                monospace: true,
                rows: 12,
                get value() {
                  return npmrcText;
                },
                set value($$value) {
                  npmrcText = $$value;
                  $$settled = false;
                }
              });
              $$renderer5.push(`<!----> <div>`);
              Button($$renderer5, {
                small: true,
                onclick: saveNpmrc,
                loading: saving,
                children: ($$renderer6) => {
                  $$renderer6.push(`<!---->${escape_html(saving ? "saving..." : "save")}`);
                },
                $$slots: { default: true }
              });
              $$renderer5.push(`<!----></div></div>`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!---->`);
        }
      });
      $$renderer3.push(`<!----> <div class="border-t border-base-b pt-4 flex flex-col gap-3 mt-2"><span class="text-muted-c text-xs uppercase tracking-wide">danger zone</span> `);
      if (!showDelete) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div>`);
        Button($$renderer3, {
          destructive: true,
          small: true,
          onclick: () => showDelete = true,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->delete project…`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<p class="text-muted-c text-xs">Stops all instances and removes config and port allocation.
        App directories are ${escape_html(removeData ? "deleted" : "kept")}.
        State files and deploy logs are always preserved.</p> `);
        Switch($$renderer3, {
          label: `remove app data (/obstetrix-projects/${name()}/)`,
          get value() {
            return removeData;
          },
          set value($$value) {
            removeData = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> `);
        Input($$renderer3, {
          placeholder: "type project name to confirm",
          monospace: true,
          compact: true,
          get value() {
            return confirmName;
          },
          set value($$value) {
            confirmName = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> <div class="flex gap-2">`);
        Button($$renderer3, {
          destructive: true,
          small: true,
          disabled: confirmName !== name() || deleting,
          loading: deleting,
          onclick: deleteProject,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(deleting ? "deleting…" : "delete")}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Button($$renderer3, {
          ghost: true,
          small: true,
          onclick: () => {
            showDelete = false;
            confirmName = "";
            removeData = false;
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->cancel`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--></div></div>`);
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
//# sourceMappingURL=_page.svelte-anyUMSHC.js.map
