<script lang="ts">
  import AtomForge from '$lib/AtomForge.svelte';
  import { onMount }   from 'svelte';
  import type { BuildEvent } from '@obstetrix/shared';
  import './layout.css';

  let { children } = $props();

  // Global SSE connection for live dashboard updates.
  // Dispatches a custom DOM event that pages can listen to.
  onMount(() => {
    const es = new EventSource('/api/events');
    es.onmessage = (e) => {
      const event: BuildEvent = JSON.parse(e.data);
      window.dispatchEvent(new CustomEvent('cicd:event', { detail: event }));
    };
    return () => es.close();
  });
</script>

<!-- CRITICAL: AtomForge must NOT be in any runes exclusion list in svelte.config.js -->
<AtomForge dark>
  <div class="min-h-screen bg-base text-control-c">
    <!-- Desktop top nav -->
    <nav class="hidden sm:flex border-b border-canvas px-6 py-3 items-center gap-6">
      <span class="font-medium text-sm text-control-c">obstetrix</span>
      <a href="/"         class="text-muted-c text-sm hover:text-control-c transition-colors">dashboard</a>
      <a href="/backups"  class="text-muted-c text-sm hover:text-control-c transition-colors">backups</a>
      <a href="/settings" class="text-muted-c text-sm hover:text-control-c transition-colors">settings</a>
    </nav>

    <main class="px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-6">
      {@render children()}
    </main>

    <!-- Mobile bottom tab bar -->
    <nav class="sm:hidden fixed bottom-0 left-0 right-0 border-t border-canvas bg-base
                flex items-center justify-around px-2 py-2
                pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
      <a href="/"         class="flex flex-col items-center gap-1 text-muted-c hover:text-control-c text-xs py-1 px-3">
        <span class="text-base">◈</span>
        <span>dashboard</span>
      </a>
      <a href="/backups"  class="flex flex-col items-center gap-1 text-muted-c hover:text-control-c text-xs py-1 px-3">
        <span class="text-base">⊞</span>
        <span>backups</span>
      </a>
      <a href="/settings" class="flex flex-col items-center gap-1 text-muted-c hover:text-control-c text-xs py-1 px-3">
        <span class="text-base">⚙</span>
        <span>settings</span>
      </a>
    </nav>
  </div>
</AtomForge>
