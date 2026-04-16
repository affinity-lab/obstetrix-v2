<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, getToastManager }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import type { ProjectState, DiskInfo, PortEntry } from '@obstetrix/shared';

  let projects  = $state<ProjectState[]>([]);
  let disk      = $state<DiskInfo[]>([]);
  let ports     = $state<PortEntry[]>([]);
  let daemon    = $state<{ startedAt: string; version: string; configRoot: string; projects: number } | null>(null);
  let reloading = $state(false);

  const toast = getToastManager();

  onMount(async () => {
    [projects, disk, daemon, ports] = await Promise.all([
      api.projects.list.$query(undefined),
      api.system.disk.$query(undefined),
      api.system.daemonStatus.$query(undefined),
      api.port.list.$query(undefined),
    ]);
  });

  async function reloadConfig() {
    reloading = true;
    try {
      const r = await api.config.reload.$command(undefined);
      toast.show(`Reloaded ${r.reloaded} project config(s)`, { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { reloading = false; }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <h1 class="text-canvas-contrast text-lg font-semibold">settings</h1>

  {#if daemon}
    <div class="bg-surface border border-frame rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-frame">
        <span class="text-muted-contrast text-xs uppercase tracking-wide">daemon</span>
      </div>
      <div class="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
        <span class="text-muted-contrast">version</span>
        <span class="text-canvas-contrast font-mono">{daemon.version}</span>
        <span class="text-muted-contrast">started</span>
        <span class="text-canvas-contrast">{new Date(daemon.startedAt).toLocaleString()}</span>
        <span class="text-muted-contrast">config root</span>
        <span class="text-canvas-contrast font-mono">{daemon.configRoot}</span>
        <span class="text-muted-contrast">projects loaded</span>
        <span class="text-canvas-contrast">{daemon.projects}</span>
      </div>
    </div>
  {/if}

  {#if disk.length > 0}
    <div class="bg-surface border border-frame rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-frame">
        <span class="text-muted-contrast text-xs uppercase tracking-wide">disk usage</span>
      </div>
      <div class="px-4 py-3 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 text-xs">
        {#each disk as d}
          <span class="text-muted-contrast">{d.label}</span>
          <span class="font-mono text-canvas-contrast">{d.usedGb.toFixed(1)} / {d.totalGb.toFixed(1)} GB</span>
          <span class="text-muted-contrast">{d.usedPct.toFixed(0)}%</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if ports.length > 0}
    <div class="bg-surface border border-frame rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-frame">
        <span class="text-muted-contrast text-xs uppercase tracking-wide">port allocations</span>
      </div>
      {#each ports as p}
        <div class="px-4 py-2.5 border-b border-frame last:border-0
                    flex items-center justify-between text-sm">
          <span class="text-canvas-contrast font-mono text-xs">{p.name}</span>
          <span class="text-muted-contrast text-xs">
            base {p.base} · {p.count} port{p.count === 1 ? '' : 's'} ·
            {p.base}–{p.base + p.count - 1}
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-surface border border-frame rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-frame">
      <span class="text-muted-contrast text-xs uppercase tracking-wide">project configs</span>
    </div>
    {#each projects as project}
      <a href="/settings/project/{project.name}"
         class="flex items-center justify-between px-4 py-3 border-b border-frame last:border-0
                hover:bg-secondary/50 transition-colors text-sm">
        <span class="text-canvas-contrast font-mono text-xs">{project.name}</span>
        <span class="text-muted-contrast text-xs">edit .conf / .env / .npmrc →</span>
      </a>
    {/each}
    {#if projects.length === 0}
      <p class="text-muted-contrast text-xs px-4 py-3">no projects configured</p>
    {/if}
  </div>

  <div class="bg-surface border border-frame rounded-lg overflow-hidden">
    <a href="/settings/nginx"
       class="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-sm">
      <span class="text-canvas-contrast">nginx</span>
      <span class="text-muted-contrast text-xs">manage sites-available, enable/disable, reload →</span>
    </a>
  </div>

  <div class="flex gap-3 flex-wrap">
    <Button small onclick={reloadConfig} loading={reloading}>
      {reloading ? 'reloading...' : 'reload configs'}
    </Button>
    <Button small ghost onclick={() => location.href = '/settings/secrets'}>
      edit obstetrix.conf
    </Button>
  </div>
</div>
