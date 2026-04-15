import { r as run, a as attr_class, i as clsx, e as ensure_array_like, x as attr_style, f as derived, b as stringify, c as escape_html, q as bind_props, w as element, d as attr, g as store_get, u as unsubscribe_stores } from "../../../../chunks/renderer.js";
import { p as page } from "../../../../chunks/stores.js";
import { a as api } from "../../../../chunks/tango.js";
import { r as relativeTime, f as formatDuration } from "../../../../chunks/format.js";
import { B as Breadcrumb } from "../../../../chunks/Breadcrumb.js";
import { C as Chip } from "../../../../chunks/Chip.js";
import { B as Button } from "../../../../chunks/Button.js";
import { I as Input } from "../../../../chunks/Input.js";
import { t as twMerge } from "../../../../chunks/bundle-mjs.js";
import { g as getToastManager } from "../../../../chunks/toast-manager.svelte.js";
function SliderView($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      values,
      min,
      step,
      size,
      disabled,
      drawStops,
      showValue,
      class: classes
    } = $$props;
    let activeThumbIndex = null;
    let percents = [];
    let visualValues = run(() => [...values]);
    let isDragging = false;
    let stops = [];
    const wrapperClass = derived(() => twMerge("relative w-full flex items-center touch-none", size === "normal" && "h-6", size === "compact" && "h-5", size === "small" && "h-4", disabled && "opacity-50 cursor-not-allowed", classes));
    const trackClass = run(() => twMerge("relative w-full rounded-full bg-secondary shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]", size === "normal" && "h-6 px-1", size === "compact" && "h-5 px-1", size === "small" && "h-4 px-1"));
    const rangeClass = run(() => twMerge("absolute bg-accent striped-10 shadow-inner z-10 top-1/2 -translate-y-1/2 rounded-full", size === "normal" && "h-4", size === "compact" && "h-3", size === "small" && "h-2"));
    const thumbClass = derived(() => twMerge("absolute bg-white rounded-full shadow-md border border-frame cursor-pointer transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-20", size === "normal" && "h-5 w-5", size === "compact" && "h-4 w-4", size === "small" && "h-3 w-3", disabled && "cursor-not-allowed"));
    const stopClass = "absolute w-1.5 h-1.5 bg-muted-contrast/50 rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2";
    const transitionStyle = derived(() => "transition: all 100ms ease-out;");
    const displayValues = derived(() => visualValues.map((v) => min + Math.round((v - min) / step) * step));
    const formatValue = derived(() => typeof showValue === "function" ? showValue : (v) => String(v));
    $$renderer2.push(`<div${attr_class(clsx(wrapperClass()))}><div role="none"${attr_class(clsx(trackClass))}>`);
    if (drawStops) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(stops);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let stopPercent = each_array[$$index];
        $$renderer2.push(`<div${attr_class(clsx(stopClass))}${attr_style("", { left: `${stringify(stopPercent)}%` })}></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (percents.length > 0) {
      $$renderer2.push("<!--[0-->");
      if (values.length > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div${attr_class(clsx(rangeClass))}${attr_style(transitionStyle(), {
          left: `${stringify(percents[0])}%`,
          right: `${stringify(100 - percents[1])}%`
        })}></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div${attr_class(clsx(rangeClass))}${attr_style(transitionStyle(), { width: `${stringify(percents[0])}%` })}></div>`);
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array_1 = ensure_array_like(percents);
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let percent = each_array_1[i];
        $$renderer2.push(`<div role="none"${attr_class(clsx(thumbClass()))}${attr_style(transitionStyle(), { left: `${stringify(percent)}%` })}>`);
        if (showValue && isDragging && activeThumbIndex === i) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 rounded bg-control border border-frame shadow-sm text-xs text-canvas-contrast tabular-nums whitespace-nowrap pointer-events-none select-none">${escape_html(formatValue()(displayValues()[i]))}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function Slider($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = 50,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      compact,
      small,
      drawStops,
      showValue,
      class: classes
    } = $$props;
    const effectiveSize = run(() => small ? "small" : compact ? "compact" : "normal");
    run(() => {
      const clamped = Math.max(min, Math.min(max, value));
      if (clamped !== value) {
        console.error(`[Slider] value (${value}) is outside [${min}, ${max}], clamped to ${clamped}.`);
        value = clamped;
      }
    });
    SliderView($$renderer2, {
      values: [value],
      min,
      step,
      size: effectiveSize,
      disabled,
      drawStops,
      showValue,
      class: classes
    });
    bind_props($$props, { value });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    const name = derived(() => store_get($$store_subs ??= {}, "$page", page).params.name);
    let project = derived(() => data.project);
    let deploying = false;
    let rollingBack = false;
    let scaleValue = derived(() => data.scale.instances);
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
        await api.scale.set.$command({ name: name(), instances: scaleValue() });
        toast.show(`Scaled to ${scaleValue()} instance${scaleValue() === 1 ? "" : "s"}`, { type: "success" });
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
      $$renderer3.push(`<!----> <div class="flex items-center gap-3"><h1 class="text-control-c text-lg font-semibold">${escape_html(project().name)}</h1> <div class="flex items-center gap-1.5">`);
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
      $$renderer3.push(`<!----></div></div> <div class="bg-raised border border-base-b rounded-lg overflow-hidden"><div class="px-4 py-3 border-b border-base-b"><span class="text-muted-c text-xs uppercase tracking-wide">info</span></div> <div class="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"><span class="text-muted-c">SHA</span> <span class="font-mono text-control-c">${escape_html(project().currentSha?.slice(0, 8) ?? "—")}</span> <span class="text-muted-c">branch</span> <span class="text-control-c">${escape_html(project().targetBranch)}</span> <span class="text-muted-c">repo</span> <span class="text-muted-c text-xs truncate">${escape_html(project().repoUrl)}</span> <span class="text-muted-c">last deploy</span> <span class="text-control-c">${escape_html(project().lastDeployAt ? relativeTime(project().lastDeployAt) : "never")} `);
      if (project().lastDeployOk !== null) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`· <span${attr_class(clsx(project().lastDeployOk ? "text-green-500" : "text-red-400"))}>${escape_html(project().lastDeployOk ? "ok" : "failed")}</span>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></span> <span class="text-muted-c">instances</span> <span class="text-control-c">${escape_html(project().instances)} / ${escape_html(project().portCount)}</span> `);
      if (project().healthCheckUrl) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<span class="text-muted-c">health check</span> <span class="text-muted-c text-xs truncate">${escape_html(project().healthCheckUrl)}</span>`);
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
        $$renderer3.push(`<div class="bg-raised border border-base-b rounded-lg px-4 py-4 flex flex-col gap-3"><span class="text-control-c text-sm font-medium">deploy specific SHA</span> `);
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
      $$renderer3.push(`<!--]--> <div class="bg-raised border border-base-b rounded-lg px-4 py-4 flex flex-col gap-4"><span class="text-control-c text-sm font-medium">scale</span> `);
      Slider($$renderer3, {
        min: 1,
        max: project().portCount,
        showValue: true,
        get value() {
          return scaleValue();
        },
        set value($$value) {
          scaleValue($$value);
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <p class="text-muted-c text-xs">${escape_html(scaleValue())} instance${escape_html(scaleValue() === 1 ? "" : "s")} ·
      ports ${escape_html(project().basePort)}–${escape_html(project().basePort + scaleValue() - 1)} ·
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
        $$renderer3.push(`<div class="bg-raised border border-base-b rounded-lg overflow-hidden"><div class="px-4 py-2 border-b border-base-b"><span class="text-muted-c text-xs uppercase tracking-wide">deploy history</span></div> <!--[-->`);
        const each_array = ensure_array_like(project().deployHistory);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let record = each_array[$$index];
          element(
            $$renderer3,
            record.deployId ? "a" : "div",
            () => {
              $$renderer3.push(`${attr("href", record.deployId ? `/project/${name()}/deploys/${encodeURIComponent(record.deployId)}` : void 0)}${attr_class(`px-4 py-2.5 border-b border-base-b last:border-0 flex items-center justify-between text-sm gap-3${stringify(record.deployId ? " hover:bg-secondary/50 transition-colors" : "")}`)}`);
            },
            () => {
              $$renderer3.push(`<span class="font-mono text-control-c text-xs">${escape_html(record.sha.slice(0, 8))}</span> <span class="text-muted-c text-xs flex-1">${escape_html(record.at)}</span> `);
              Chip($$renderer3, {
                color: record.ok ? "green" : "red",
                children: ($$renderer4) => {
                  $$renderer4.push(`<!---->${escape_html(record.ok ? "ok" : "failed")}`);
                },
                $$slots: { default: true }
              });
              $$renderer3.push(`<!----> <span class="text-muted-c text-xs">${escape_html(formatDuration(record.durationMs))}</span>`);
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
