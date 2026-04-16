import { c as escape_html, a as attr_class, h as clsx, d as attr, e as ensure_array_like, i as element, b as stringify, f as derived, g as store_get, u as unsubscribe_stores } from "../../../../chunks/renderer.js";
import { p as page } from "../../../../chunks/stores.js";
import { a as api } from "../../../../chunks/tango.js";
import { r as relativeTime, f as formatDuration } from "../../../../chunks/format.js";
import { B as Breadcrumb } from "../../../../chunks/Breadcrumb.js";
import { C as Chip } from "../../../../chunks/Chip.js";
import { B as Button } from "../../../../chunks/Button.js";
import { I as Input } from "../../../../chunks/Input.js";
import { g as getToastManager } from "../../../../chunks/toast-manager.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let project = derived(() => data.project);
    let deploying = false;
    let rollingBack = false;
    let scaleValue = data.scale.instances;
    let scaling = false;
    let showShaInput = false;
    let deploySha = "";
    let deployingSha = false;
    const toast = getToastManager();
    async function deploy() {
      deploying = true;
      try {
        await api.deploy.trigger.$command({ name: name() });
        toast.show("Deploy queued — watch logs for progress", { type: "success" });
      } catch (e) {
        toast.show(`Deploy failed: ${e}`, { type: "error" });
      } finally {
        deploying = false;
      }
    }
    async function deployWithSha() {
      const sha = deploySha.trim();
      if (!sha) return;
      deployingSha = true;
      try {
        await api.deploy.trigger.$command({ name: name(), sha });
        toast.show(`Deploy queued for ${sha.slice(0, 8)}`, { type: "success" });
        showShaInput = false;
        deploySha = "";
      } catch (e) {
        toast.show(`Deploy failed: ${e}`, { type: "error" });
      } finally {
        deployingSha = false;
      }
    }
    async function rollback() {
      rollingBack = true;
      try {
        await api.deploy.rollback.$command({ name: name() });
        toast.show("Rollback queued", { type: "info" });
      } catch (e) {
        toast.show(`Rollback failed: ${e}`, { type: "error" });
      } finally {
        rollingBack = false;
      }
    }
    async function applyScale() {
      scaling = true;
      try {
        await api.scale.set.$command({ name: name(), instances: scaleValue });
        toast.show(`Scaled to ${scaleValue} instance${scaleValue === 1 ? "" : "s"}`, { type: "success" });
      } catch (e) {
        toast.show(`Scale failed: ${e}`, { type: "error" });
      } finally {
        scaling = false;
      }
    }
    function statusColor(status) {
      switch (status) {
        case "running":
          return "green";
        case "failed":
          return "red";
        case "building":
          return "blue";
        default:
          return "base";
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col gap-6 max-w-2xl">`);
      Breadcrumb($$renderer3, {
        items: [{ label: "dashboard", href: "/" }, { label: name() }]
      });
      $$renderer3.push(`<!----> <div class="flex items-center gap-3"><h1 class="text-canvas-contrast text-lg font-semibold">${escape_html(project().name)}</h1> <div class="flex items-center gap-1.5">`);
      if (project().status === "building") {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<span class="inline-block w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></span>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      Chip($$renderer3, {
        color: statusColor(project().status),
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(project().status)}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> <div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="px-4 py-3 border-b border-frame"><span class="text-muted-contrast text-xs uppercase tracking-wide">info</span></div> <div class="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"><span class="text-muted-contrast">SHA</span> <span class="font-mono text-canvas-contrast">${escape_html(project().currentSha?.slice(0, 8) ?? "—")}</span> <span class="text-muted-contrast">branch</span> <span class="text-canvas-contrast">${escape_html(project().targetBranch)}</span> <span class="text-muted-contrast">repo</span> <span class="text-muted-contrast text-xs truncate">${escape_html(project().repoUrl)}</span> <span class="text-muted-contrast">last deploy</span> <span class="text-canvas-contrast">${escape_html(project().lastDeployAt ? relativeTime(project().lastDeployAt) : "never")} `);
      if (project().lastDeployOk !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`· <span${attr_class(clsx(project().lastDeployOk ? "text-green-500" : "text-red-400"))}>${escape_html(project().lastDeployOk ? "ok" : "failed")}</span>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></span> <span class="text-muted-contrast">instances</span> <span class="text-canvas-contrast">${escape_html(project().instances)} / ${escape_html(project().portCount)}</span> `);
      if (project().healthCheckUrl) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<span class="text-muted-contrast">health check</span> <span class="text-muted-contrast text-xs truncate">${escape_html(project().healthCheckUrl)}</span>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div></div> <div class="flex gap-2 flex-wrap">`);
      Button($$renderer3, {
        onclick: deploy,
        loading: deploying,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(deploying ? "deploying..." : "deploy now")}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        ghost: true,
        small: true,
        onclick: () => {
          showShaInput = !showShaInput;
          deploySha = "";
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->deploy sha…`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        ghost: true,
        onclick: () => location.href = `/project/${name()}/logs`,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->logs`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        ghost: true,
        onclick: () => location.href = `/project/${name()}/journal`,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->journal`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        ghost: true,
        onclick: () => location.href = `/project/${name()}/deploys`,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->deploys`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        ghost: true,
        onclick: () => location.href = `/settings/project/${name()}`,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->settings`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      if (project().previousSha) {
        $$renderer3.push("<!--[0-->");
        Button($$renderer3, {
          destructive: true,
          onclick: rollback,
          loading: rollingBack,
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(rollingBack ? "rolling back..." : `rollback to ${project().previousSha.slice(0, 8)}`)}`);
          },
          $$slots: { default: true }
        });
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      if (showShaInput) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="bg-surface border border-frame rounded-lg px-4 py-4 flex flex-col gap-3"><span class="text-canvas-contrast text-sm font-medium">deploy specific SHA</span> `);
        Input($$renderer3, {
          placeholder: "full or short SHA",
          monospace: true,
          compact: true,
          get value() {
            return deploySha;
          },
          set value($$value) {
            deploySha = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> <div class="flex gap-2">`);
        Button($$renderer3, {
          small: true,
          onclick: deployWithSha,
          loading: deployingSha,
          disabled: !deploySha.trim(),
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(deployingSha ? "deploying…" : "deploy")}`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        Button($$renderer3, {
          ghost: true,
          small: true,
          onclick: () => {
            showShaInput = false;
            deploySha = "";
          },
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->cancel`);
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----></div></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="bg-surface border border-frame rounded-lg px-4 py-4 flex flex-col gap-4"><div class="flex items-center justify-between"><span class="text-canvas-contrast text-sm font-medium">scale</span> <span class="text-canvas-contrast text-sm font-mono tabular-nums">${escape_html(scaleValue)}</span></div> <input type="range"${attr("value", scaleValue)}${attr("min", 1)}${attr("max", project().portCount)}${attr("step", 1)} class="w-full h-1.5 rounded-full cursor-pointer appearance-none bg-frame [&amp;::-webkit-slider-thumb]:appearance-none [&amp;::-webkit-slider-thumb]:w-4 [&amp;::-webkit-slider-thumb]:h-4 [&amp;::-webkit-slider-thumb]:rounded-full [&amp;::-webkit-slider-thumb]:bg-accent [&amp;::-webkit-slider-thumb]:cursor-pointer [&amp;::-moz-range-thumb]:w-4 [&amp;::-moz-range-thumb]:h-4 [&amp;::-moz-range-thumb]:rounded-full [&amp;::-moz-range-thumb]:bg-accent [&amp;::-moz-range-thumb]:border-0 [&amp;::-moz-range-thumb]:cursor-pointer"/> <p class="text-muted-contrast text-xs">${escape_html(scaleValue)} instance${escape_html(scaleValue === 1 ? "" : "s")} ·
      ports ${escape_html(project().basePort)}–${escape_html(project().basePort + scaleValue - 1)} ·
      max ${escape_html(project().portCount)}</p> <div>`);
      Button($$renderer3, {
        small: true,
        onclick: applyScale,
        loading: scaling,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->${escape_html(scaling ? "scaling..." : "apply")}`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></div> `);
      if (project().deployHistory.length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="bg-surface border border-frame rounded-lg overflow-hidden"><div class="px-4 py-2 border-b border-frame"><span class="text-muted-contrast text-xs uppercase tracking-wide">deploy history</span></div> <!--[-->`);
        const each_array = ensure_array_like(project().deployHistory);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let record = each_array[$$index];
          element(
            $$renderer3,
            record.deployId ? "a" : "div",
            () => {
              $$renderer3.push(`${attr("href", record.deployId ? `/project/${name()}/deploys/${encodeURIComponent(record.deployId)}` : void 0)}${attr_class(`px-4 py-2.5 border-b border-frame last:border-0 flex items-center justify-between text-sm gap-3${stringify(record.deployId ? " hover:bg-secondary/50 transition-colors" : "")}`)}`);
            },
            () => {
              $$renderer3.push(`<span class="font-mono text-canvas-contrast text-xs">${escape_html(record.sha.slice(0, 8))}</span> <span class="text-muted-contrast text-xs flex-1">${escape_html(record.at)}</span> `);
              Chip($$renderer3, {
                color: record.ok ? "green" : "red",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(record.ok ? "ok" : "failed")}`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!----> <span class="text-muted-contrast text-xs">${escape_html(formatDuration(record.durationMs))}</span>`);
            }
          );
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
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
export {
  _page as default
};
