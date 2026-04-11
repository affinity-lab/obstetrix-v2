<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import type { BuildEvent } from '@obstetrix/shared';

  const name = $derived($page.params.name);
  let lines  = $state<{ text: string; isError: boolean }[]>([]);
  let logEl  = $state<HTMLElement | null>(null);
  let connected = $state(false);

  onMount(() => {
    const es = new EventSource(`/api/logs/${name}`);
    connected = true;

    es.onmessage = (e) => {
      const event: BuildEvent = JSON.parse(e.data);
      if (event.type === 'log') {
        lines = [...lines.slice(-500), {
          text: `[${event.ts}] ${event.line}`,
          isError: event.level === 'error',
        }];
        setTimeout(() => logEl?.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' }), 10);
      } else if (event.type === 'status') {
        lines = [...lines.slice(-500), {
          text: `[${event.ts}] → status: ${event.status}`,
          isError: false,
        }];
      } else if (event.type === 'deploy_complete') {
        const ok = event.ok ? 'OK' : 'FAILED';
        lines = [...lines.slice(-500), {
          text: `[${event.ts}] → deploy ${ok} sha=${event.sha.slice(0, 8)} duration=${event.durationMs}ms`,
          isError: !event.ok,
        }];
      }
    };

    es.onerror = () => { connected = false; };

    return () => es.close();
  });
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-3">
    <a href="/project/{name}" class="text-muted-c text-sm hover:text-control-c">← {name}</a>
    <span class="text-control-c text-sm">live logs</span>
    {#if connected}
      <span class="text-xs text-accent">● live</span>
    {:else}
      <span class="text-xs text-red-400">disconnected</span>
    {/if}
  </div>

  <div
    bind:this={logEl}
    class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
           h-[70vh] overflow-y-auto p-4 whitespace-pre-wrap"
  >
    {#if lines.length === 0}
      <span class="text-muted-c">waiting for log output...</span>
    {:else}
      {#each lines as line}
        <div class={line.isError ? 'text-red-400' : ''}>{line.text}</div>
      {/each}
    {/if}
  </div>
</div>
