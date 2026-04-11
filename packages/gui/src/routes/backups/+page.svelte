<script lang="ts">
  import { onMount } from 'svelte';
  import { Button }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import type { ProjectState, BackupResult } from '@obstetrix/shared';

  let projects = $state<ProjectState[]>([]);
  let backups  = $state<Record<string, BackupResult[]>>({});
  let running  = $state<Record<string, boolean>>({});

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
    } finally {
      running = { ...running, [name]: false };
    }
  }

  async function runSystem() {
    running = { ...running, __system: true };
    try {
      await api.backup.runSystem.$command(undefined);
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
    <h1 class="text-control-c text-lg font-medium">backups</h1>
    <Button small secondary onclick={runSystem} disabled={running['__system']}>
      {running['__system'] ? 'running...' : 'system backup'}
    </Button>
  </div>

  {#each projects as project}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-canvas">
        <a href="/backups/{project.name}" class="text-control-c text-sm font-medium hover:underline">
          {project.name}
        </a>
        <Button micro onclick={() => runBackup(project.name)} disabled={running[project.name]}>
          {running[project.name] ? 'running...' : 'backup now'}
        </Button>
      </div>
      {#if (backups[project.name] ?? []).length === 0}
        <p class="text-muted-c text-xs px-4 py-3">no backups yet</p>
      {:else}
        {#each (backups[project.name] ?? []).slice(0, 3) as b}
          <div class="flex items-center gap-3 px-4 py-2 border-b border-canvas last:border-0 text-xs">
            <span class="text-muted-c flex-1">{b.createdAt}</span>
            <span class="text-muted-c font-mono">{fmt(b.sizeBytes)}</span>
            <a
              href="/api/backup/download?path={encodeURIComponent(b.path)}"
              class="text-muted-c hover:text-control-c"
              download
            >↓</a>
          </div>
        {/each}
        {#if (backups[project.name] ?? []).length > 3}
          <a href="/backups/{project.name}"
             class="block px-4 py-2 text-muted-c text-xs hover:text-control-c">
            view all {backups[project.name].length} backups →
          </a>
        {/if}
      {/if}
    </div>
  {/each}

  {#if projects.length === 0}
    <p class="text-muted-c text-sm">no projects configured</p>
  {/if}
</div>
