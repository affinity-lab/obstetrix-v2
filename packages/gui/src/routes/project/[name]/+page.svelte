<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';
  import { relativeTime, formatDuration } from '$lib/format.js';
  import type { ProjectState, ProjectStatus } from '@obstetrix/shared';

  let { data } = $props();

  const name = $derived($page.params.name);
  let project    = $derived<ProjectState>(data.project);
  let deploying  = $state(false);
  let rollingBack = $state(false);
  let scaleValue  = $derived(data.scale.instances);
  let scaling     = $state(false);
  let msg         = $state<string | null>(null);

  // Deploy with specific SHA
  let showShaInput = $state(false);
  let deploySha    = $state('');
  let deployingSha = $state(false);

  async function deploy() {
    deploying = true; msg = null;
    try {
      await api.deploy.trigger.$command({ name });
      msg = 'deploy queued — watch logs for progress';
    } catch (e) { msg = `error: ${e}`; }
    finally { deploying = false; }
  }

  async function deployWithSha() {
    const sha = deploySha.trim();
    if (!sha) return;
    deployingSha = true; msg = null;
    try {
      await api.deploy.trigger.$command({ name, sha });
      msg = `deploy queued for ${sha.slice(0, 8)} — watch logs for progress`;
      showShaInput = false;
      deploySha = '';
    } catch (e) { msg = `error: ${e}`; }
    finally { deployingSha = false; }
  }

  async function rollback() {
    rollingBack = true; msg = null;
    try {
      await api.deploy.rollback.$command({ name });
      msg = 'rollback queued';
    } catch (e) { msg = `error: ${e}`; }
    finally { rollingBack = false; }
  }

  async function applyScale() {
    scaling = true; msg = null;
    try {
      await api.scale.set.$command({ name, instances: scaleValue });
      msg = `scaled to ${scaleValue} instance${scaleValue === 1 ? '' : 's'}`;
    } catch (e) { msg = `error: ${e}`; }
    finally { scaling = false; }
  }

  function statusColor(status: ProjectStatus): 'accent' | 'red' | 'blue' | undefined {
    switch (status) {
      case 'running':  return 'accent';
      case 'failed':   return 'red';
      case 'building': return 'blue';
      default:         return undefined;
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <div class="flex items-center gap-3">
    <a href="/" class="text-muted-c text-sm hover:text-control-c">← dashboard</a>
  </div>

  <div class="flex items-center gap-3">
    <h1 class="text-control-c text-lg font-medium">{project.name}</h1>
    <Badge color={statusColor(project.status)}>{project.status}</Badge>
  </div>

  <div class="bg-raised border border-canvas rounded-lg px-4 py-4 grid grid-cols-2 gap-y-2 text-sm">
    <span class="text-muted-c">SHA</span>
    <span class="font-mono text-control-c">{project.currentSha?.slice(0, 8) ?? '—'}</span>
    <span class="text-muted-c">branch</span>
    <span class="text-control-c">{project.targetBranch}</span>
    <span class="text-muted-c">repo</span>
    <span class="text-muted-c text-xs truncate">{project.repoUrl}</span>
    <span class="text-muted-c">last deploy</span>
    <span class="text-control-c">
      {project.lastDeployAt ? relativeTime(project.lastDeployAt) : 'never'}
    </span>
    <span class="text-muted-c">deploy ok</span>
    <span class="text-control-c">
      {project.lastDeployOk === null ? '—' : project.lastDeployOk ? 'yes' : 'no'}
    </span>
    <span class="text-muted-c">instances</span>
    <span class="text-control-c">{project.instances} / {project.portCount}</span>
    {#if project.healthCheckUrl}
      <span class="text-muted-c">health check</span>
      <span class="text-muted-c text-xs truncate">{project.healthCheckUrl}</span>
    {/if}
  </div>

  <div class="flex gap-2 flex-wrap">
    <Button onclick={deploy} disabled={deploying}>
      {deploying ? 'deploying...' : 'deploy now'}
    </Button>
    <Button ghost small onclick={() => { showShaInput = !showShaInput; deploySha = ''; }}>
      deploy sha…
    </Button>
    <Button ghost onclick={() => location.href = `/project/${name}/logs`}>view logs</Button>
    <Button ghost onclick={() => location.href = `/project/${name}/deploys`}>deploys</Button>
    <Button ghost onclick={() => location.href = `/settings/project/${name}`}>settings</Button>
    {#if project.previousSha}
      <Button destructive onclick={rollback} disabled={rollingBack}>
        {rollingBack ? 'rolling back...' : `rollback to ${project.previousSha.slice(0, 8)}`}
      </Button>
    {/if}
  </div>

  {#if showShaInput}
    <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
      <span class="text-control-c text-sm font-medium">deploy specific SHA</span>
      <input
        bind:value={deploySha}
        placeholder="full or short SHA"
        class="bg-base border border-canvas rounded font-mono text-xs text-control-c
               px-3 py-2 outline-none focus:border-accent"
      />
      <div class="flex gap-2">
        <Button small onclick={deployWithSha} disabled={deployingSha || !deploySha.trim()}>
          {deployingSha ? 'deploying…' : 'deploy'}
        </Button>
        <Button ghost small onclick={() => { showShaInput = false; deploySha = ''; }}>cancel</Button>
      </div>
    </div>
  {/if}

  <!-- Scale slider -->
  <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
    <span class="text-control-c text-sm font-medium">scale</span>
    <div class="flex items-center gap-4">
      <input
        type="range"
        min="1"
        max={project.portCount}
        bind:value={scaleValue}
        class="flex-1 accent-accent"
      />
      <span class="text-control-c text-sm font-mono w-6 text-right">{scaleValue}</span>
    </div>
    <p class="text-muted-c text-xs">
      {scaleValue} instance{scaleValue === 1 ? '' : 's'} ·
      ports {project.basePort}–{project.basePort + scaleValue - 1} ·
      max {project.portCount}
    </p>
    <Button small onclick={applyScale} disabled={scaling}>
      {scaling ? 'scaling...' : 'apply'}
    </Button>
  </div>

  {#if project.deployHistory.length > 0}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      <div class="px-4 py-2 border-b border-canvas">
        <span class="text-muted-c text-xs uppercase tracking-wide">deploy history</span>
      </div>
      {#each project.deployHistory as record}
        <div class="px-4 py-2 border-b border-canvas last:border-0 flex items-center justify-between text-sm">
          <span class="font-mono text-control-c">{record.sha.slice(0, 8)}</span>
          <span class="text-muted-c text-xs">{record.at}</span>
          <Badge color={record.ok ? 'accent' : 'red'}>{record.ok ? 'ok' : 'failed'}</Badge>
          <span class="text-muted-c text-xs">{formatDuration(record.durationMs)}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if msg}
    <p class="text-muted-c text-xs">{msg}</p>
  {/if}
</div>
