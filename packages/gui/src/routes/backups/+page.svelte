<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, EmptyState, getToastManager } from '@atom-forge/ui';
  import { IconArchive } from '@tabler/icons-svelte';
  import { api }     from '$lib/tango.js';
  import type { ProjectState, BackupResult } from '@obstetrix/shared';

  let projects = $state<ProjectState[]>([]);
  let backups  = $state<Record<string, BackupResult[]>>({});
  let running  = $state<Record<string, boolean>>({});

  const toast = getToastManager();

  onMount(async () => {
    projects = await api.projects.list.$query(undefined);
    const entries = await Promise.all(
      projects.map(async (p) => [p.name, await api.backup.list.$query({ name: p.name })] as const)
    );
    backups = Object.fromEntries(entries);
  });

  async function runBackup(name: string) {
    running = { ...running, [name]: true };
    try {
      const result = await api.backup.run.$command({ name });
      backups = { ...backups, [name]: [result, ...(backups[name] ?? [])] };
      toast.show(`Backup created for ${name}`, { type: 'success' });
    } catch (e) {
      toast.show(`Backup failed: ${e}`, { type: 'error' });
    } finally {
      running = { ...running, [name]: false };
    }
  }

  async function runSystem() {
    running = { ...running, __system: true };
    try {
      await api.backup.runSystem.$command(undefined);
      toast.show('System backup started', { type: 'success' });
    } catch (e) {
      toast.show(`Backup failed: ${e}`, { type: 'error' });
    } finally {
      running = { ...running, __system: false };
    }
  }

  function fmt(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center justify-between">
    <h1 class="text-canvas-contrast text-lg font-semibold">backups</h1>
    <Button small secondary onclick={runSystem} loading={running['__system']}>
      {running['__system'] ? 'running...' : 'system backup'}
    </Button>
  </div>

  {#if projects.length === 0}
    <EmptyState
      icon={IconArchive}
      title="No projects"
      description="Create a project to start taking backups"
    />
  {:else}
    {#each projects as project}
      <div class="bg-surface border border-frame rounded-lg overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-frame">
          <a href="/backups/{project.name}" class="text-canvas-contrast text-sm font-medium hover:underline">
            {project.name}
          </a>
          <Button micro onclick={() => runBackup(project.name)} loading={running[project.name]}>
            {running[project.name] ? 'running...' : 'backup now'}
          </Button>
        </div>
        {#if (backups[project.name] ?? []).length === 0}
          <p class="text-muted-contrast text-xs px-4 py-3">no backups yet</p>
        {:else}
          {#each (backups[project.name] ?? []).slice(0, 3) as b}
            <div class="flex items-center gap-3 px-4 py-2.5 border-b border-frame last:border-0 text-xs">
              <span class="text-muted-contrast flex-1">{b.createdAt}</span>
              <span class="text-muted-contrast font-mono">{fmt(b.sizeBytes)}</span>
              <a
                href="/api/backup/download?path={encodeURIComponent(b.path)}"
                class="text-muted-contrast hover:text-canvas-contrast"
                download
              >↓ download</a>
            </div>
          {/each}
          {#if (backups[project.name] ?? []).length > 3}
            <a href="/backups/{project.name}"
               class="block px-4 py-2 text-muted-contrast text-xs hover:text-canvas-contrast hover:bg-secondary/50 transition-colors">
              view all {backups[project.name].length} backups →
            </a>
          {/if}
        {/if}
      </div>
    {/each}
  {/if}
</div>
