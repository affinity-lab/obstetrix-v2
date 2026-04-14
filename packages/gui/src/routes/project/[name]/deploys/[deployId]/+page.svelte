<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import { formatDuration, isPhaseHeader } from '$lib/format.js';
  import type { DeployLogEntry, DeployLogMeta } from '@obstetrix/shared';

  const name     = $derived($page.params.name);
  const deployId = $derived($page.params.deployId);
  let entries    = $state<DeployLogEntry[]>([]);
  let meta       = $state<DeployLogMeta | null>(null);
  let loading    = $state(true);
  let redeploying = $state(false);
  let msg        = $state<string | null>(null);

  onMount(async () => {
    try {
      const logs = (await api.deployLogs.list.$query({ name })) ?? [];
      const found = logs.find((l) => l.deployId === $page.params.deployId);
      if (found) {
        meta = found;
        entries = (await api.deployLogs.read.$query({ path: found.path })) ?? [];
      }
    } finally {
      loading = false;
    }
  });

  async function redeploy() {
    if (!meta) return;
    redeploying = true; msg = null;
    try {
      await api.deploy.trigger.$command({ name, sha: meta.sha });
      msg = `deploy queued for ${meta.sha}`;
    } catch (e) {
      msg = `error: ${e}`;
    } finally {
      redeploying = false;
    }
  }

  function lineClass(entry: DeployLogEntry): string {
    if (entry.type === 'start') return 'text-accent font-medium';
    if (entry.type === 'end')   return entry.ok ? 'text-accent font-medium' : 'text-red-400 font-medium';
    if (entry.level === 'error') return 'text-red-400';
    if (entry.line && isPhaseHeader(entry.line)) return 'text-accent';
    return 'text-control-c';
  }

  function formatTs(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 text-sm flex-wrap">
    <a href="/project/{name}" class="text-muted-c hover:text-control-c">{name}</a>
    <span class="text-muted-c">/</span>
    <a href="/project/{name}/deploys" class="text-muted-c hover:text-control-c">deploys</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c font-mono text-xs">{meta?.sha ?? decodeURIComponent(deployId)}</span>
  </div>

  {#if meta}
    <div class="flex items-center gap-3 flex-wrap">
      {#if meta.ok === null}
        <Badge color="blue">running</Badge>
      {:else}
        <Badge color={meta.ok ? 'accent' : 'red'}>{meta.ok ? 'ok' : 'failed'}</Badge>
      {/if}
      {#if meta.durationMs > 0}
        <span class="text-muted-c text-xs">{formatDuration(meta.durationMs)}</span>
      {/if}
      {#if meta.ok !== null}
        <Button micro ghost onclick={redeploy} disabled={redeploying}>
          {redeploying ? 're-deploying…' : `↩ re-deploy ${meta.sha}`}
        </Button>
      {/if}
    </div>
    {#if msg}
      <p class="text-muted-c text-xs">{msg}</p>
    {/if}
  {/if}

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if entries.length === 0}
    <p class="text-muted-c text-sm">log not found</p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg font-mono text-xs p-4 overflow-auto max-h-[75vh]">
      {#each entries as entry}
        {#if entry.type === 'start'}
          <div class={lineClass(entry)}>
            <span class="text-muted-c select-none">[{formatTs(entry.ts)}]</span>
            {' '}deploy started · sha={entry.sha?.slice(0, 8)} · project={entry.project}
          </div>
        {:else if entry.type === 'end'}
          <div class="{lineClass(entry)} mt-1">
            <span class="text-muted-c select-none">[{formatTs(entry.ts)}]</span>
            {' '}{entry.ok ? '✓ deploy OK' : '✗ deploy FAILED'}
            {entry.durationMs ? ` · ${formatDuration(entry.durationMs)}` : ''}
            {entry.error ? ` · ${entry.error}` : ''}
          </div>
        {:else}
          <div class={lineClass(entry)}>
            <span class="text-muted-c select-none">[{formatTs(entry.ts)}]</span>
            {' '}{entry.line}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
