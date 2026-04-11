<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Badge }   from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import type { DeployLogMeta } from '@obstetrix/shared';

  const name = $derived($page.params.name);
  let logs    = $state<DeployLogMeta[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      logs = await api.deployLogs.list.$query({ name });
    } finally {
      loading = false;
    }
  });
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 text-sm">
    <a href="/project/{name}" class="text-muted-c hover:text-control-c">← {name}</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c">deploys</span>
  </div>

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if logs.length === 0}
    <p class="text-muted-c text-sm">no deploy logs yet</p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      {#each logs as log}
        <a
          href="/project/{name}/deploys/{encodeURIComponent(log.deployId)}"
          class="flex items-center gap-3 px-4 py-3 border-b border-canvas last:border-0
                 hover:bg-base transition-colors text-sm"
        >
          <span class="font-mono text-control-c text-xs">{log.sha}</span>
          <span class="text-muted-c text-xs flex-1">{log.startedAt}</span>
          {#if log.ok === null}
            <Badge color="blue">running</Badge>
          {:else}
            <Badge color={log.ok ? 'accent' : 'red'}>{log.ok ? 'ok' : 'failed'}</Badge>
          {/if}
          {#if log.durationMs > 0}
            <span class="text-muted-c text-xs">{log.durationMs}ms</span>
          {/if}
        </a>
      {/each}
    </div>
  {/if}
</div>
