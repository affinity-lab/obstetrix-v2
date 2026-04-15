<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Chip, Button, ButtonBar, Breadcrumb } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import { formatDuration, shortTime, relativeTime } from '$lib/format.js';
  import type { DeployLogMeta, BuildEvent } from '@obstetrix/shared';

  const name = $derived($page.params.name);
  let logs      = $state<DeployLogMeta[]>([]);
  let loading   = $state(true);
  let filter    = $state<'all' | 'ok' | 'failed' | 'running'>('all');
  let redeploying = $state<string | null>(null);

  const filtered = $derived(
    filter === 'all'     ? logs :
    filter === 'running' ? logs.filter(l => l.ok === null) :
    filter === 'ok'      ? logs.filter(l => l.ok === true) :
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
    try {
      await api.deploy.trigger.$command({ name, sha });
    } catch {
      // silently fail — user can retry
    } finally {
      redeploying = null;
    }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 flex-wrap">
    <Breadcrumb items={[
      { label: 'dashboard', href: '/' },
      { label: name, href: `/project/${name}` },
      { label: 'deploys' },
    ]} />
    <span class="flex-1"></span>
    <Button ghost small onclick={load}>refresh</Button>
  </div>

  <!-- Filter bar -->
  <ButtonBar>
    {#each (['all', 'running', 'ok', 'failed'] as const) as f}
      <Button
        small
        onclick={() => filter = f}
        class={filter === f ? '' : 'opacity-60'}
      >{f}</Button>
    {/each}
  </ButtonBar>

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if filtered.length === 0}
    <p class="text-muted-c text-sm">
      {filter === 'all' ? 'no deploy logs yet' : `no ${filter} deploys`}
    </p>
  {:else}
    <div class="bg-raised border border-base-b rounded-lg overflow-hidden">
      {#each filtered as log}
        <div class="border-b border-base-b last:border-0">
          <a
            href="/project/{name}/deploys/{encodeURIComponent(log.deployId)}"
            class="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-sm"
          >
            <span class="font-mono text-control-c text-xs w-16 shrink-0">{log.sha}</span>
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <span class="text-control-c text-xs">{shortTime(log.startedAt)}</span>
              <span class="text-muted-c text-xs">{relativeTime(log.startedAt)}</span>
            </div>
            {#if log.ok === null}
              <Chip color="blue">running</Chip>
            {:else}
              <Chip color={log.ok ? 'green' : 'red'}>{log.ok ? 'ok' : 'failed'}</Chip>
            {/if}
            <span class="text-muted-c text-xs w-14 text-right shrink-0">
              {formatDuration(log.durationMs)}
            </span>
          </a>
          {#if log.ok !== null}
            <div class="px-4 pb-2 flex items-center gap-2">
              <Button
                micro ghost
                disabled={redeploying === log.deployId}
                loading={redeploying === log.deployId}
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
