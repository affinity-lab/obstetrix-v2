<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Breadcrumb }  from '@atom-forge/ui';
  import { isPhaseHeader } from '$lib/format.js';
  import type { BuildEvent } from '@obstetrix/shared';

  const name = $derived($page.params.name);

  type LogLine = { ts: string; text: string; kind: 'phase' | 'error' | 'meta' | 'normal' };

  let lines     = $state<LogLine[]>([]);
  let logEl     = $state<HTMLElement | null>(null);
  let connected = $state(false);
  let autoScroll = $state(true);

  let es: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectDelay = 1000;

  function formatTs(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  function push(line: LogLine) {
    lines = [...lines.slice(-999), line];
    if (autoScroll) {
      setTimeout(() => logEl?.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' }), 10);
    }
  }

  function connect() {
    if (es) { es.close(); es = null; }
    es = new EventSource(`/api/logs/${name}`);
    connected = true;
    reconnectDelay = 1000;

    es.onmessage = (e) => {
      const event: BuildEvent = JSON.parse(e.data);
      if (event.type === 'log') {
        push({
          ts:   event.ts,
          text: event.line ?? '',
          kind: event.level === 'error' ? 'error'
              : isPhaseHeader(event.line ?? '') ? 'phase'
              : 'normal',
        });
      } else if (event.type === 'status') {
        push({ ts: event.ts, text: `→ status: ${event.status}`, kind: 'meta' });
      } else if (event.type === 'deploy_complete') {
        const ok = event.ok ? '✓ deploy OK' : '✗ deploy FAILED';
        push({
          ts:   event.ts,
          text: `${ok} · sha=${event.sha.slice(0, 8)} · ${Math.round(event.durationMs / 1000)}s`,
          kind: event.ok ? 'phase' : 'error',
        });
      }
    };

    es.onerror = () => {
      connected = false;
      es?.close(); es = null;
      reconnectTimer = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
        connect();
      }, reconnectDelay);
    };
  }

  onMount(() => {
    connect();
    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  });

  function handleScroll() {
    if (!logEl) return;
    const nearBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 40;
    autoScroll = nearBottom;
  }

  function scrollToBottom() {
    autoScroll = true;
    logEl?.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
  }
</script>

<div class="flex flex-col gap-3 h-full">
  <div class="flex items-center gap-3 flex-wrap">
    <Breadcrumb items={[
      { label: 'dashboard', href: '/' },
      { label: name, href: `/project/${name}` },
      { label: 'live logs' },
    ]} />
    <span class="flex-1"></span>
    {#if connected}
      <span class="inline-flex items-center gap-1 text-xs text-green-500">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>live
      </span>
    {:else}
      <span class="inline-flex items-center gap-1 text-xs text-red-400">
        <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>reconnecting…
      </span>
    {/if}
    <span class="text-muted-c text-xs">{lines.length} line{lines.length === 1 ? '' : 's'}</span>
    {#if !autoScroll}
      <Button micro ghost onclick={scrollToBottom}>↓ bottom</Button>
    {/if}
    <Button micro ghost onclick={() => lines = []}>clear</Button>
  </div>

  <div
    bind:this={logEl}
    onscroll={handleScroll}
    class="bg-raised border border-base-b rounded-lg font-mono text-xs
           h-[75vh] overflow-y-auto p-4"
  >
    {#if lines.length === 0}
      <span class="text-muted-c">waiting for log output…</span>
    {:else}
      {#each lines as line}
        <div class="flex gap-2 leading-5
                    {line.kind === 'phase'  ? 'text-accent' :
                     line.kind === 'error'  ? 'text-red-400' :
                     line.kind === 'meta'   ? 'text-blue-400' :
                                             'text-control-c'}">
          <span class="text-muted-c select-none shrink-0">[{formatTs(line.ts)}]</span>
          <span class="whitespace-pre-wrap break-all">{line.text}</span>
        </div>
      {/each}
    {/if}
  </div>
</div>
