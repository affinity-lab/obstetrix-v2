<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import type { BackupResult } from '@obstetrix/shared';

  const name  = $derived($page.params.name);
  let backups = $state<BackupResult[]>([]);
  let running = $state(false);

  onMount(async () => {
    backups = await api.backup.list.$query({ name });
  });

  async function runBackup() {
    running = true;
    try {
      const result = await api.backup.run.$command({ name });
      backups = [result, ...backups];
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
    <div class="flex items-center gap-2 text-sm">
      <a href="/backups" class="text-muted-c hover:text-control-c">backups</a>
      <span class="text-muted-c">/</span>
      <span class="text-control-c">{name}</span>
    </div>
    <Button small onclick={runBackup} disabled={running}>
      {running ? 'running...' : 'backup now'}
    </Button>
  </div>

  {#if backups.length === 0}
    <p class="text-muted-c text-sm">no backups yet</p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      {#each backups as b}
        <div class="flex items-center gap-3 px-4 py-3 border-b border-canvas last:border-0 text-sm">
          <span class="text-muted-c text-xs flex-1">{b.createdAt}</span>
          <span class="font-mono text-xs text-muted-c">{fmt(b.sizeBytes)}</span>
          <a
            href="/api/backup/download?path={encodeURIComponent(b.path)}"
            class="text-muted-c hover:text-control-c text-xs"
            download
          >download</a>
        </div>
      {/each}
    </div>
  {/if}
</div>
