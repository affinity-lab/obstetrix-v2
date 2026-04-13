<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';
  import type { ProjectState, BuildEvent, ProjectStatus } from '@obstetrix/shared';

  let projects = $state<ProjectState[]>([]);
  let loading  = $state(true);
  let error    = $state<string | null>(null);

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
