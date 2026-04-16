<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { Button, Breadcrumb } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';

  const name     = $derived($page.params.name);
  let output     = $state('');
  let loading    = $state(true);
  let autoRefresh = $state(false);
  let lines      = $state(300);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function load() {
    loading = true;
    try {
      const res = await api.journal.tail.$query({ name, lines });
      output = res?.output ?? '(no output)';
    } catch (e) {
      output = `error: ${e}`;
    } finally {
      loading = false;
    }
  }

  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
      intervalId = setInterval(load, 5000);
    } else {
      if (intervalId !== null) clearInterval(intervalId);
      intervalId = null;
    }
  }

  function lineClass(line: string): string {
    const l = line.toLowerCase();
    if (l.includes('error') || l.includes('fatal') || l.includes('panic')) return 'text-red-400';
    if (l.includes('warn'))  return 'text-yellow-400';
    return 'text-canvas-contrast';
  }

  onMount(load);
  onDestroy(() => { if (intervalId !== null) clearInterval(intervalId); });
</script>

<div class="flex flex-col gap-4 max-w-4xl">
  <div class="flex items-center gap-2 flex-wrap">
    <Breadcrumb items={[
      { label: 'dashboard', href: '/' },
      { label: name, href: `/project/${name}` },
      { label: 'journal' },
    ]} />
    <span class="flex-1"></span>
    <!-- styled native select — NativeSelect takes options[] not children -->
    <select
      bind:value={lines}
      onchange={load}
      class="bg-control border border-frame rounded-md h-8 text-xs text-canvas-contrast
             px-2 outline-none focus:ring-2 focus:ring-ring cursor-pointer"
    >
      <option value={100}>last 100</option>
      <option value={300}>last 300</option>
      <option value={500}>last 500</option>
      <option value={1000}>last 1000</option>
    </select>
    <Button ghost small onclick={load} disabled={loading}>
      {loading ? 'loading…' : 'refresh'}
    </Button>
    <Button ghost small onclick={toggleAutoRefresh}>
      {autoRefresh ? 'stop auto' : 'auto (5s)'}
    </Button>
  </div>

  {#if loading && !output}
    <p class="text-muted-contrast text-sm">loading…</p>
  {:else}
    <div class="bg-surface border border-frame rounded-lg font-mono text-xs p-4 overflow-auto max-h-[80vh] whitespace-pre-wrap">
      {#each output.split('\n') as line}
        {#if line}
          <div class={lineClass(line)}>{line}</div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
