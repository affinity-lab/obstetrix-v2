<script lang="ts">
  import { onMount } from 'svelte';
  import { Button }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import type { ProjectState, DiskInfo, PortEntry } from '@obstetrix/shared';

  let projects  = $state<ProjectState[]>([]);
  let disk      = $state<DiskInfo[]>([]);
  let ports     = $state<PortEntry[]>([]);
  let daemon    = $state<{ startedAt: string; version: string; configRoot: string; projects: number } | null>(null);
  let reloading = $state(false);
  let reloadMsg = $state<string | null>(null);

  onMount(async () => {
    [projects, disk, daemon, ports] = await Promise.all([
      api.projects.list.$query(undefined),
      api.system.disk.$query(undefined),
      api.system.daemonStatus.$query(undefined),
      api.port.list.$query(undefined),
    ]);
  });

  async function reloadConfig() {
    reloading = true; reloadMsg = null;
    try {
      const r = await api.config.reload.$command(undefined);
      reloadMsg = `reloaded ${r.reloaded} project config(s)`;
    } catch (e) { reloadMsg = `error: ${e}`; }
    finally { reloading = false; }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <h1 class="text-control-c text-lg font-medium">settings</h1>

  {#if daemon}
    <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
      <span class="text-control-c text-sm font-medium">daemon</span>
      <div class="grid grid-cols-2 gap-y-2 text-xs">
        <span class="text-muted-c">version</span>
        <span class="text-control-c font-mono">{daemon.version}</span>
        <span class="text-muted-c">started</span>
        <span class="text-control-c">{new Date(daemon.startedAt).toLocaleString()}</span>
        <span class="text-muted-c">config root</span>
        <span class="text-control-c font-mono">{daemon.configRoot}</span>
        <span class="text-muted-c">projects loaded</span>
        <span class="text-control-c">{daemon.projects}</span>
      </div>
    </div>
  {/if}

  {#if disk.length > 0}
    <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
      <span class="text-control-c text-sm font-medium">disk usage</span>
      <div class="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-xs">
        {#each disk as d}
          <span class="text-muted-c">{d.label}</span>
          <span class="font-mono text-control-c">{d.usedGb.toFixed(1)} / {d.totalGb.toFixed(1)} GB</span>
          <span class="text-muted-c">{d.usedPct.toFixed(0)}%</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if ports.length > 0}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      <div class="px-4 py-2 border-b border-canvas">
        <span class="text-control-c text-sm font-medium">port allocations</span>
      </div>
      {#each ports as p}
        <div class="px-4 py-2 border-b border-canvas last:border-0
                    flex items-center justify-between text-sm">
          <span class="text-control-c font-mono">{p.name}</span>
          <span class="text-muted-c text-xs">
            base {p.base} · {p.count} port{p.count === 1 ? '' : 's'} ·
            {p.base}–{p.base + p.count - 1}
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-canvas">
      <span class="text-control-c text-sm font-medium">project configs</span>
    </div>
    {#each projects as project}
      <a href="/settings/project/{project.name}"
         class="flex items-center justify-between px-4 py-3 border-b border-canvas last:border-0
                hover:bg-base transition-colors text-sm">
        <span class="text-control-c font-mono">{project.name}</span>
        <span class="text-muted-c text-xs">edit .conf / .env / .npmrc →</span>
      </a>
    {/each}
    {#if projects.length === 0}
      <p class="text-muted-c text-xs px-4 py-3">no projects configured</p>
    {/if}
  </div>

  <div class="flex gap-3 flex-wrap">
    <Button small onclick={reloadConfig} disabled={reloading}>
      {reloading ? 'reloading...' : 'reload configs'}
    </Button>
    <Button small ghost onclick={() => location.href = '/settings/secrets'}>
      edit obstetrix.conf
    </Button>
  </div>
  {#if reloadMsg}<p class="text-muted-c text-xs">{reloadMsg}</p>{/if}
</div>
