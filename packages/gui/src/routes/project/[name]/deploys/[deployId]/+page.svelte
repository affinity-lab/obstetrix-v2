<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { api }     from '$lib/tango.js';
  import type { DeployLogEntry } from '@obstetrix/shared';

  const name     = $derived($page.params.name);
  const deployId = $derived($page.params.deployId);
  let entries = $state<DeployLogEntry[]>([]);
  let loading = $state(true);
  let logPath = $state('');

  onMount(async () => {
    try {
      // deployId is the filename stem; reconstruct the full path
      const logs = await api.deployLogs.list.$query({ name });
      const meta = logs.find((l) => l.deployId === decodeURIComponent(deployId));
      if (meta) {
        logPath = meta.path;
        entries = await api.deployLogs.read.$query({ path: meta.path });
      }
    } finally {
      loading = false;
    }
  });
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 text-sm">
    <a href="/project/{name}" class="text-muted-c hover:text-control-c">{name}</a>
    <span class="text-muted-c">/</span>
    <a href="/project/{name}/deploys" class="text-muted-c hover:text-control-c">deploys</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c font-mono text-xs">{deployId}</span>
  </div>

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if entries.length === 0}
    <p class="text-muted-c text-sm">log not found</p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg font-mono text-xs p-4 overflow-auto max-h-[75vh] whitespace-pre-wrap">
      {#each entries as entry}
        {#if entry.type === 'start'}
          <div class="text-accent">
            [{entry.ts}] deploy started sha={entry.sha} project={entry.project}
          </div>
        {:else if entry.type === 'end'}
          <div class={entry.ok ? 'text-accent' : 'text-red-400'}>
            [{entry.ts}] deploy {entry.ok ? 'OK' : 'FAILED'}
            {entry.durationMs ? ` duration=${entry.durationMs}ms` : ''}
            {entry.error ? ` error=${entry.error}` : ''}
          </div>
        {:else if entry.level === 'error'}
          <div class="text-red-400">[{entry.ts}] {entry.line}</div>
        {:else}
          <div class="text-control-c">[{entry.ts}] {entry.line}</div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
