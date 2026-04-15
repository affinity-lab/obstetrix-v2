<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Breadcrumb, EmptyState, getToastManager } from '@atom-forge/ui';
  import { IconArchive } from '@tabler/icons-svelte';
  import { api }     from '$lib/tango.js';
  import type { BackupResult } from '@obstetrix/shared';

  const name  = $derived($page.params.name);
  let backups = $state<BackupResult[]>([]);
  let running = $state(false);

  const toast = getToastManager();

  onMount(async () => {
    backups = await api.backup.list.$query({ name });
  });

  async function runBackup() {
    running = true;
    try {
      const result = await api.backup.run.$command({ name });
      backups = [result, ...backups];
      toast.show('Backup created', { type: 'success' });
    } catch (e) {
      toast.show(`Backup failed: ${e}`, { type: 'error' });
    } finally {
      running = false;
    }
  }

  function fmt(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center justify-between">
    <Breadcrumb items={[
      { label: 'backups', href: '/backups' },
      { label: name },
    ]} />
    <Button small onclick={runBackup} loading={running}>
      {running ? 'running...' : 'backup now'}
    </Button>
  </div>

  {#if backups.length === 0}
    <EmptyState
      icon={IconArchive}
      title="No backups yet"
      description="Click backup now to create the first backup"
    />
  {:else}
    <div class="bg-raised border border-base-b rounded-lg overflow-hidden">
      {#each backups as b}
        <div class="flex items-center gap-3 px-4 py-3 border-b border-base-b last:border-0 text-sm">
          <span class="text-muted-c text-xs flex-1">{b.createdAt}</span>
          <span class="font-mono text-xs text-muted-c">{fmt(b.sizeBytes)}</span>
          <a
            href="/api/backup/download?path={encodeURIComponent(b.path)}"
            class="text-muted-c hover:text-control-c text-xs"
            download
          >↓ download</a>
        </div>
      {/each}
    </div>
  {/if}
</div>
