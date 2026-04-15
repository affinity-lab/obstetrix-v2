import { h as attributes, i as clsx, e as ensure_array_like, c as escape_html, f as derived, d as attr, b as stringify, g as store_get, u as unsubscribe_stores } from "../../../../../chunks/renderer.js";
import { p as page } from "../../../../../chunks/stores.js";
import { a as api } from "../../../../../chunks/tango.js";
import { s as shortTime, r as relativeTime, f as formatDuration } from "../../../../../chunks/format.js";
import { B as Breadcrumb } from "../../../../../chunks/Breadcrumb.js";
import { B as Button } from "../../../../../chunks/Button.js";
import { t as twMerge } from "../../../../../chunks/bundle-mjs.js";
import { C as Chip } from "../../../../../chunks/Chip.js";
function ButtonBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { class: classes = "", children, $$slots, $$events, ...props } = $$props;
    $$renderer2.push(`<span${attributes(
      {
        class: clsx(twMerge("inline-flex items-center gap-px rounded-surface bg-secondary border border-frame overflow-hidden", classes)),
        ...props
      },
      "svelte-xvqe0o"
    )}>`);
    children?.($$renderer2);
    $$renderer2.push(`<!----></span>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let logs = [];
    let loading = true;
    let filter = "all";
    let redeploying = null;
    const filtered = derived(() => filter === "all" ? logs : filter === "running" ? logs.filter((l) => l.ok === null) : filter === "ok" ? logs.filter((l) => l.ok === true) : logs.filter((l) => l.ok === false));
    async function load() {
      try {
        logs = await api.deployLogs.list.$query({ name: name() }) ?? [];
      } finally {
        loading = false;
      }
    }
    async function redeploy(sha, deployId) {
      redeploying = deployId;
      try {
        await api.deploy.trigger.$command({ name: name(), sha });
      } catch {
      } finally {
        redeploying = null;
      }
    }
    $$renderer2.push(`<div class="flex flex-col gap-4 max-w-2xl"><div class="flex items-center gap-2 flex-wrap">`);
    Breadcrumb($$renderer2, {
      items: [
        { label: "dashboard", href: "/" },
        { label: name(), href: `/project/${name()}` },
        { label: "deploys" }
      ]
    });
    $$renderer2.push(`<!----> <span class="flex-1"></span> `);
    Button($$renderer2, {
      ghost: true,
      small: true,
      onclick: load,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->refresh`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div> `);
    ButtonBar($$renderer2, {
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(["all", "running", "ok", "failed"]);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let f = each_array[$$index];
          Button($$renderer3, {
            small: true,
            onclick: () => filter = f,
            class: filter === f ? "" : "opacity-60",
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->${escape_html(f)}`);
            },
            $$slots: { default: true }
          });
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-muted-c text-sm">loading...</p>`);
    } else if (filtered().length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<p class="text-muted-c text-sm">${escape_html(filter === "all" ? "no deploy logs yet" : `no ${filter} deploys`)}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="bg-raised border border-base-b rounded-lg overflow-hidden"><!--[-->`);
      const each_array_1 = ensure_array_like(filtered());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let log = each_array_1[$$index_1];
        $$renderer2.push(`<div class="border-b border-base-b last:border-0"><a${attr("href", `/project/${stringify(name())}/deploys/${stringify(encodeURIComponent(log.deployId))}`)} class="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-sm"><span class="font-mono text-control-c text-xs w-16 shrink-0">${escape_html(log.sha)}</span> <div class="flex-1 min-w-0 flex flex-col gap-0.5"><span class="text-control-c text-xs">${escape_html(shortTime(log.startedAt))}</span> <span class="text-muted-c text-xs">${escape_html(relativeTime(log.startedAt))}</span></div> `);
        if (log.ok === null) {
          $$renderer2.push("<!--[0-->");
          Chip($$renderer2, {
            color: "blue",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->running`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer2.push("<!--[-1-->");
          Chip($$renderer2, {
            color: log.ok ? "green" : "red",
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->${escape_html(log.ok ? "ok" : "failed")}`);
            },
            $$slots: { default: true }
          });
        }
        $$renderer2.push(`<!--]--> <span class="text-muted-c text-xs w-14 text-right shrink-0">${escape_html(formatDuration(log.durationMs))}</span></a> `);
        if (log.ok !== null) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="px-4 pb-2 flex items-center gap-2">`);
          Button($$renderer2, {
            micro: true,
            ghost: true,
            disabled: redeploying === log.deployId,
            loading: redeploying === log.deployId,
            onclick: (e) => {
              e.stopPropagation();
              redeploy(log.sha, log.deployId);
            },
            children: ($$renderer3) => {
              $$renderer3.push(`<!---->${escape_html(redeploying === log.deployId ? "re-deploying…" : `↩ re-deploy ${log.sha}`)}`);
            },
            $$slots: { default: true }
          });
          $$renderer2.push(`<!----></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
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
