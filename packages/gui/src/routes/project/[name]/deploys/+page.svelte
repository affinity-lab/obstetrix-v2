<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Badge, Button }   from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import { formatDuration, shortTime, relativeTime } from '$lib/format.js';
  import type { DeployLogMeta, BuildEvent } from '@obstetrix/shared';

  const name = $derived($page.params.name);
  let logs      = $state<DeployLogMeta[]>([]);
  let loading   = $state(true);
  let filter    = $state<'all' | 'ok' | 'failed' | 'running'>('all');
  let redeploying = $state<string | null>(null); // deployId being redeployed
  let msg       = $state<string | null>(null);

  const filtered = $derived(
    filter === 'all' ? logs :
    filter === 'running' ? logs.filter(l => l.ok === null) :
    filter === 'ok' ? logs.filter(l => l.ok === true) :
    logs.filter(l => l.ok === false)
  );

  async function load() {
    try {
      logs = (await api.deployLogs.list.$query({ name })) ?? [];
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();
    // Refresh list when a deploy completes
    const handler = (e: Event) => {
      const event = (e as CustomEvent<BuildEvent>).detail;
      if (event.projectName === name && event.type === 'deploy_complete') {
        load();
      }
    };
    window.addEventListener('cicd:event', handler);
    return () => window.removeEventListener('cicd:event', handler);
  });

  async function redeploy(sha: string, deployId: string) {
    redeploying = deployId;
    msg = null;
    try {
      await api.deploy.trigger.$command({ name, sha });
      msg = `deploy queued for ${sha}`;
    } catch (e) {
      msg = `error: ${e}`;
    } finally {
      redeploying = null;
    }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 text-sm flex-wrap">
    <a href="/project/{name}" class="text-muted-c hover:text-control-c">← {name}</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c">deploys</span>
    <span class="flex-1"></span>
    <Button ghost small onclick={load}>refresh</Button>
  </div>

  <!-- Filter bar -->
  <div class="flex gap-1">
    {#each (['all', 'running', 'ok', 'failed'] as const) as f}
      <button
        onclick={() => filter = f}
        class="px-3 py-1.5 text-xs rounded transition-colors
               {filter === f
                 ? 'bg-accent text-white'
                 : 'text-muted-c hover:text-control-c border border-canvas'}"
      >{f}</button>
    {/each}
  </div>

  {#if msg}
    <p class="text-muted-c text-xs">{msg}</p>
  {/if}

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if filtered.length === 0}
    <p class="text-muted-c text-sm">
      {filter === 'all' ? 'no deploy logs yet' : `no ${filter} deploys`}
    </p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      {#each filtered as log}
        <div class="border-b border-canvas last:border-0">
          <a
            href="/project/{name}/deploys/{encodeURIComponent(log.deployId)}"
            class="flex items-center gap-3 px-4 py-3 hover:bg-base transition-colors text-sm"
          >
            <span class="font-mono text-control-c text-xs w-16 shrink-0">{log.sha}</span>
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <span class="text-control-c text-xs">{shortTime(log.startedAt)}</span>
              <span class="text-muted-c text-xs">{relativeTime(log.startedAt)}</span>
            </div>
            {#if log.ok === null}
              <Badge color="blue">running</Badge>
            {:else}
              <Badge color={log.ok ? 'accent' : 'red'}>{log.ok ? 'ok' : 'failed'}</Badge>
            {/if}
            <span class="text-muted-c text-xs w-14 text-right shrink-0">
              {formatDuration(log.durationMs)}
            </span>
          </a>
          <!-- Re-deploy row -->
          {#if log.ok !== null}
            <div class="px-4 pb-2 flex items-center gap-2">
              <Button
                micro ghost
                disabled={redeploying === log.deployId}
                onclick={(e: MouseEvent) => { e.stopPropagation(); redeploy(log.sha, log.deployId); }}
              >
                {redeploying === log.deployId ? 're-deploying…' : `↩ re-deploy ${log.sha}`}
              </Button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
