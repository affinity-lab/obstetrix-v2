<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';
  import type { ProjectState, BuildEvent, ProjectStatus } from '@obstetrix/shared';

  let projects = $state<ProjectState[]>([]);
  let loading  = $state(true);
  let error    = $state<string | null>(null);

  // New project form
  let showCreate  = $state(false);
  let newName     = $state('');
  let newRepoUrl  = $state('');
  let newBranch   = $state('main');
  let newPorts    = $state(4);
  let creating    = $state(false);
  let createError = $state<string | null>(null);

  async function load() {
    try {
      projects = (await api.projects.list.$query(undefined)) ?? [];
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    load();

    // Live updates from the global SSE stream (dispatched by +layout.svelte)
    const handler = (e: Event) => {
      const event = (e as CustomEvent<BuildEvent>).detail;
      projects = projects.map((p) => {
        if (p.name !== event.projectName) return p;
        if (event.type === 'status') {
          return { ...p, status: event.status };
        }
        if (event.type === 'deploy_complete') {
          return {
            ...p,
            status: event.ok ? 'running' : 'failed',
            currentSha: event.ok ? event.sha : p.currentSha,
            lastDeployAt: event.ts,
            lastDeployOk: event.ok,
          };
        }
        return p;
      });
    };
    window.addEventListener('cicd:event', handler);
    return () => window.removeEventListener('cicd:event', handler);
  });

  async function deploy(name: string) {
    await api.deploy.trigger.$command({ name });
  }

  function cancelCreate() {
    showCreate = false;
    newName = ''; newRepoUrl = ''; newBranch = 'main'; newPorts = 4;
    createError = null;
  }

  async function createProject() {
    createError = null;
    if (!/^[a-z0-9-]+$/.test(newName)) {
      createError = 'name must be lowercase letters, numbers, and hyphens only';
      return;
    }
    if (!newRepoUrl.trim()) {
      createError = 'repo URL is required';
      return;
    }
    creating = true;
    try {
      await api.config.createProject.$command({
        name: newName.trim(),
        repoUrl: newRepoUrl.trim(),
        branch: newBranch.trim() || 'main',
        ports: newPorts,
      });
      location.href = `/settings/project/${newName.trim()}`;
    } catch (e) {
      createError = String(e);
      creating = false;
    }
  }

  function statusColor(status: ProjectStatus): 'accent' | 'red' | 'blue' | undefined {
    switch (status) {
      case 'running':  return 'accent';
      case 'failed':   return 'red';
      case 'building': return 'blue';
      default:         return undefined;
    }
  }

  function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
</script>

<div class="flex items-center justify-between mb-4">
  <span class="text-muted-c text-xs uppercase tracking-wide">projects</span>
  {#if !showCreate}
    <Button small onclick={() => showCreate = true}>new project</Button>
  {/if}
</div>

{#if showCreate}
  <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3 mb-4">
    <span class="text-control-c text-sm font-medium">new project</span>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">name</label>
        <input
          bind:value={newName}
          placeholder="my-app"
          class="bg-base border border-canvas rounded font-mono text-xs text-control-c
                 px-3 py-2 outline-none focus:border-accent"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">repo URL</label>
        <input
          bind:value={newRepoUrl}
          placeholder="https://github.com/org/repo"
          class="bg-base border border-canvas rounded text-xs text-control-c
                 px-3 py-2 outline-none focus:border-accent"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">branch</label>
        <input
          bind:value={newBranch}
          placeholder="main"
          class="bg-base border border-canvas rounded text-xs text-control-c
                 px-3 py-2 outline-none focus:border-accent"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">ports (max instances)</label>
        <input
          type="number"
          bind:value={newPorts}
          min="1"
          max="16"
          class="bg-base border border-canvas rounded text-xs text-control-c
                 px-3 py-2 outline-none focus:border-accent"
        />
      </div>
    </div>
    {#if createError}
      <p class="text-red-400 text-xs">{createError}</p>
    {/if}
    <div class="flex gap-2">
      <Button small onclick={createProject} disabled={creating}>
        {creating ? 'creating…' : 'create'}
      </Button>
      <Button ghost small onclick={cancelCreate} disabled={creating}>cancel</Button>
    </div>
  </div>
{/if}

{#if loading}
  <p class="text-muted-c text-sm">loading...</p>
{:else if error}
  <p class="text-red-400 text-sm">{error}</p>
{:else if projects.length === 0}
  <p class="text-muted-c text-sm">no projects configured in /etc/obstetrix/projects/</p>
{:else}
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {#each projects as project (project.name)}
      <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <a href="/project/{project.name}" class="text-control-c font-medium text-sm hover:underline">
            {project.name}
          </a>
          <Badge color={statusColor(project.status)}>{project.status}</Badge>
        </div>

        {#if project.currentSha}
          <p class="text-muted-c text-xs font-mono">{project.currentSha.slice(0, 8)}</p>
        {/if}

        {#if project.lastDeployAt}
          <p class="text-muted-c text-xs">
            deployed {relativeTime(project.lastDeployAt)}
          </p>
        {/if}

        <div class="flex gap-2 mt-auto">
          <Button small onclick={() => deploy(project.name)}>deploy</Button>
          <Button ghost small onclick={() => location.href = `/project/${project.name}/logs`}>logs</Button>
        </div>
      </div>
    {/each}
  </div>
{/if}
