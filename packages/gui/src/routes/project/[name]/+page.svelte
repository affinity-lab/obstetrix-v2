<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Chip, Button, Breadcrumb, Input, Slider, getToastManager } from '@atom-forge/ui';
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

  // Deploy with specific SHA
  let showShaInput = $state(false);
  let deploySha    = $state('');
  let deployingSha = $state(false);

  const toast = getToastManager();

  async function deploy() {
    deploying = true;
    try {
      await api.deploy.trigger.$command({ name });
      toast.show('Deploy queued — watch logs for progress', { type: 'success' });
    } catch (e) {
      toast.show(`Deploy failed: ${e}`, { type: 'error' });
    } finally { deploying = false; }
  }

  async function deployWithSha() {
    const sha = deploySha.trim();
    if (!sha) return;
    deployingSha = true;
    try {
      await api.deploy.trigger.$command({ name, sha });
      toast.show(`Deploy queued for ${sha.slice(0, 8)}`, { type: 'success' });
      showShaInput = false;
      deploySha = '';
    } catch (e) {
      toast.show(`Deploy failed: ${e}`, { type: 'error' });
    } finally { deployingSha = false; }
  }

  async function rollback() {
    rollingBack = true;
    try {
      await api.deploy.rollback.$command({ name });
      toast.show('Rollback queued', { type: 'info' });
    } catch (e) {
      toast.show(`Rollback failed: ${e}`, { type: 'error' });
    } finally { rollingBack = false; }
  }

  async function applyScale() {
    scaling = true;
    try {
      await api.scale.set.$command({ name, instances: scaleValue });
      toast.show(`Scaled to ${scaleValue} instance${scaleValue === 1 ? '' : 's'}`, { type: 'success' });
    } catch (e) {
      toast.show(`Scale failed: ${e}`, { type: 'error' });
    } finally { scaling = false; }
  }

  function statusColor(status: ProjectStatus): 'green' | 'red' | 'blue' | 'base' {
    switch (status) {
      case 'running':  return 'green';
      case 'failed':   return 'red';
      case 'building': return 'blue';
      default:         return 'base';
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <Breadcrumb items={[{ label: 'dashboard', href: '/' }, { label: name }]} />

  <div class="flex items-center gap-3">
    <h1 class="text-control-c text-lg font-semibold">{project.name}</h1>
    <div class="flex items-center gap-1.5">
      {#if project.status === 'building'}
        <span class="inline-block w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></span>
      {/if}
      <Chip color={statusColor(project.status)}>{project.status}</Chip>
    </div>
  </div>

  <div class="bg-raised border border-base-b rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-base-b">
      <span class="text-muted-c text-xs uppercase tracking-wide">info</span>
    </div>
    <div class="px-4 py-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      <span class="text-muted-c">SHA</span>
      <span class="font-mono text-control-c">{project.currentSha?.slice(0, 8) ?? '—'}</span>
      <span class="text-muted-c">branch</span>
      <span class="text-control-c">{project.targetBranch}</span>
      <span class="text-muted-c">repo</span>
      <span class="text-muted-c text-xs truncate">{project.repoUrl}</span>
      <span class="text-muted-c">last deploy</span>
      <span class="text-control-c">
        {project.lastDeployAt ? relativeTime(project.lastDeployAt) : 'never'}
        {#if project.lastDeployOk !== null}
          · <span class={project.lastDeployOk ? 'text-green-500' : 'text-red-400'}>
            {project.lastDeployOk ? 'ok' : 'failed'}
          </span>
        {/if}
      </span>
      <span class="text-muted-c">instances</span>
      <span class="text-control-c">{project.instances} / {project.portCount}</span>
      {#if project.healthCheckUrl}
        <span class="text-muted-c">health check</span>
        <span class="text-muted-c text-xs truncate">{project.healthCheckUrl}</span>
      {/if}
    </div>
  </div>

  <div class="flex gap-2 flex-wrap">
    <Button onclick={deploy} loading={deploying}>
      {deploying ? 'deploying...' : 'deploy now'}
    </Button>
    <Button ghost small onclick={() => { showShaInput = !showShaInput; deploySha = ''; }}>
      deploy sha…
    </Button>
    <Button ghost onclick={() => location.href = `/project/${name}/logs`}>logs</Button>
    <Button ghost onclick={() => location.href = `/project/${name}/journal`}>journal</Button>
    <Button ghost onclick={() => location.href = `/project/${name}/deploys`}>deploys</Button>
    <Button ghost onclick={() => location.href = `/settings/project/${name}`}>settings</Button>
    {#if project.previousSha}
      <Button destructive onclick={rollback} loading={rollingBack}>
        {rollingBack ? 'rolling back...' : `rollback to ${project.previousSha.slice(0, 8)}`}
      </Button>
    {/if}
  </div>

  {#if showShaInput}
    <div class="bg-raised border border-base-b rounded-lg px-4 py-4 flex flex-col gap-3">
      <span class="text-control-c text-sm font-medium">deploy specific SHA</span>
      <Input
        bind:value={deploySha}
        placeholder="full or short SHA"
        monospace
        compact
      />
      <div class="flex gap-2">
        <Button small onclick={deployWithSha} loading={deployingSha} disabled={!deploySha.trim()}>
          {deployingSha ? 'deploying…' : 'deploy'}
        </Button>
        <Button ghost small onclick={() => { showShaInput = false; deploySha = ''; }}>cancel</Button>
      </div>
    </div>
  {/if}

  <!-- Scale slider -->
  <div class="bg-raised border border-base-b rounded-lg px-4 py-4 flex flex-col gap-4">
    <span class="text-control-c text-sm font-medium">scale</span>
    <Slider
      bind:value={scaleValue}
      min={1}
      max={project.portCount}
      showValue
    />
    <p class="text-muted-c text-xs">
      {scaleValue} instance{scaleValue === 1 ? '' : 's'} ·
      ports {project.basePort}–{project.basePort + scaleValue - 1} ·
      max {project.portCount}
    </p>
    <div>
      <Button small onclick={applyScale} loading={scaling}>
        {scaling ? 'scaling...' : 'apply'}
      </Button>
    </div>
  </div>

  {#if project.deployHistory.length > 0}
    <div class="bg-raised border border-base-b rounded-lg overflow-hidden">
      <div class="px-4 py-2 border-b border-base-b">
        <span class="text-muted-c text-xs uppercase tracking-wide">deploy history</span>
      </div>
      {#each project.deployHistory as record}
        <svelte:element
          this={record.deployId ? 'a' : 'div'}
          href={record.deployId ? `/project/${name}/deploys/${encodeURIComponent(record.deployId)}` : undefined}
          class="px-4 py-2.5 border-b border-base-b last:border-0 flex items-center justify-between text-sm gap-3{record.deployId ? ' hover:bg-secondary/50 transition-colors' : ''}"
        >
          <span class="font-mono text-control-c text-xs">{record.sha.slice(0, 8)}</span>
          <span class="text-muted-c text-xs flex-1">{record.at}</span>
          <Chip color={record.ok ? 'green' : 'red'}>{record.ok ? 'ok' : 'failed'}</Chip>
          <span class="text-muted-c text-xs">{formatDuration(record.durationMs)}</span>
        </svelte:element>
      {/each}
    </div>
  {/if}
</div>
