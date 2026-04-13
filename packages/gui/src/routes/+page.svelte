<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';
  import { relativeTime } from '$lib/format.js';
  import { BUILD_TEMPLATES, templateToConf } from '$lib/templates.js';
  import type { ProjectState, BuildEvent, ProjectStatus } from '@obstetrix/shared';

  let projects = $state<ProjectState[]>([]);
  let loading  = $state(true);
  let error    = $state<string | null>(null);

  // New project form
  let showCreate    = $state(false);
  let newName       = $state('');
  let newRepoUrl    = $state('');
  let newBranch     = $state('main');
  let newPorts      = $state(4);
  let selectedTpl   = $state<string>('');
  let creating      = $state(false);
  let createError   = $state<string | null>(null);

  // Track which projects are deploying for optimistic spinner
  let deployingSet  = $state(new Set<string>());

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

    const handler = (e: Event) => {
      const event = (e as CustomEvent<BuildEvent>).detail;
      projects = projects.map((p) => {
        if (p.name !== event.projectName) return p;
        if (event.type === 'status') {
          return { ...p, status: event.status };
        }
        if (event.type === 'deploy_complete') {
          deployingSet.delete(event.projectName);
          deployingSet = new Set(deployingSet);
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
    deployingSet = new Set([...deployingSet, name]);
    try {
      await api.deploy.trigger.$command({ name });
    } catch {
      deployingSet.delete(name);
      deployingSet = new Set(deployingSet);
    }
  }

  function cancelCreate() {
    showCreate = false;
    newName = ''; newRepoUrl = ''; newBranch = 'main'; newPorts = 4; selectedTpl = '';
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
      const { name: created } = await api.config.createProject.$command({
        name:    newName.trim(),
        repoUrl: newRepoUrl.trim(),
        branch:  newBranch.trim() || 'main',
        ports:   newPorts,
      });
      // If a template was chosen, pre-fill project.conf
      if (selectedTpl) {
        const tpl = BUILD_TEMPLATES.find(t => t.id === selectedTpl);
        if (tpl) {
          const conf = templateToConf(tpl, newRepoUrl.trim(), newBranch.trim() || 'main');
          const changes: Record<string, string> = {};
          for (const line of conf.split('\n')) {
            const eq = line.indexOf('=');
            if (eq > 0) changes[line.slice(0, eq)] = line.slice(eq + 1);
          }
          await api.config.setProjectConf.$command({ name: created, changes });
        }
      }
      location.href = `/settings/project/${created}`;
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
</script>

<div class="flex items-center justify-between mb-4">
  <span class="text-muted-c text-xs uppercase tracking-wide">projects</span>
  {#if !showCreate}
    <Button small onclick={() => showCreate = true}>new project</Button>
  {/if}
</div>

{#if showCreate}
  <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-4 mb-4">
    <span class="text-control-c text-sm font-medium">new project</span>

    <!-- Template picker -->
    <div class="flex flex-col gap-1">
      <label class="text-muted-c text-xs">template (optional)</label>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {#each BUILD_TEMPLATES as tpl}
          <button
            onclick={() => selectedTpl = selectedTpl === tpl.id ? '' : tpl.id}
            class="text-left px-3 py-2 rounded border text-xs transition-colors
                   {selectedTpl === tpl.id
                     ? 'border-accent text-control-c bg-base'
                     : 'border-canvas text-muted-c hover:text-control-c hover:border-canvas'}"
          >
            <div class="font-medium">{tpl.label}</div>
            <div class="text-xs opacity-70 mt-0.5">{tpl.description}</div>
          </button>
        {/each}
      </div>
      {#if selectedTpl}
        {@const tpl = BUILD_TEMPLATES.find(t => t.id === selectedTpl)}
        {#if tpl}
          <p class="text-muted-c text-xs mt-1">
            BUILD_CMD: <span class="font-mono text-control-c">{tpl.buildCmd}</span>
          </p>
        {/if}
      {/if}
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">name <span class="text-red-400">*</span></label>
        <input
          bind:value={newName}
          placeholder="my-app"
          class="bg-base border border-canvas rounded font-mono text-xs text-control-c
                 px-3 py-2 outline-none focus:border-accent"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-muted-c text-xs">repo URL <span class="text-red-400">*</span></label>
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
        <label class="text-muted-c text-xs">max instances (port count)</label>
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
  <p class="text-muted-c text-sm">no projects — create one above or run
    <span class="font-mono">obstetrix-ctl project create &lt;name&gt;</span>
  </p>
{:else}
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    {#each projects as project (project.name)}
      {@const isDeploying = deployingSet.has(project.name)}
      <div class="bg-raised border border-canvas rounded-lg px-4 py-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <a href="/project/{project.name}" class="text-control-c font-medium text-sm hover:underline">
            {project.name}
          </a>
          <Badge color={statusColor(project.status)}>{project.status}</Badge>
        </div>

        <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
          {#if project.currentSha}
            <span class="text-muted-c">sha</span>
            <span class="font-mono text-control-c">{project.currentSha.slice(0, 8)}</span>
          {/if}
          <span class="text-muted-c">instances</span>
          <span class="text-control-c">{project.instances} / {project.portCount}</span>
          {#if project.lastDeployAt}
            <span class="text-muted-c">deployed</span>
            <span class="text-control-c">{relativeTime(project.lastDeployAt)}</span>
          {/if}
        </div>

        <div class="flex gap-2 mt-auto">
          <Button small onclick={() => deploy(project.name)} disabled={isDeploying}>
            {isDeploying ? 'queued…' : 'deploy'}
          </Button>
          <Button ghost small onclick={() => location.href = `/project/${project.name}`}>detail</Button>
          <Button ghost small onclick={() => location.href = `/project/${project.name}/logs`}>logs</Button>
        </div>
      </div>
    {/each}
  </div>
{/if}
