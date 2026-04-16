<script lang="ts">
  import AtomForge from '$lib/AtomForge.svelte';
  import { onMount }   from 'svelte';
  import { page }      from '$app/stores';
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

  const navLinks = [
    { href: '/',               label: 'dashboard' },
    { href: '/backups',        label: 'backups'   },
    { href: '/settings',       label: 'settings'  },
    { href: '/settings/nginx', label: 'nginx'     },
  ];

  function isActive(href: string, pathname: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
</script>

<!-- CRITICAL: AtomForge must NOT be in any runes exclusion list in svelte.config.js -->
<AtomForge dark>
  <div class="min-h-screen bg-canvas text-canvas-contrast">
    <!-- Desktop top nav -->
    <nav class="hidden sm:flex bg-surface border-b border-frame px-6 h-12 items-center gap-1">
      <span class="font-semibold text-sm text-canvas-contrast mr-4">obstetrix</span>
      {#each navLinks as link}
        <a
          href={link.href}
          class="px-3 py-1.5 rounded-md text-sm transition-colors
                 {isActive(link.href, $page.url.pathname)
                   ? 'bg-secondary text-canvas-contrast font-medium'
                   : 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary/50'}"
        >{link.label}</a>
      {/each}
    </nav>

    <main class="px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-6">
      {@render children()}
    </main>

    <!-- Mobile bottom tab bar -->
    <nav class="sm:hidden fixed bottom-0 left-0 right-0 border-t border-frame bg-surface
                flex items-center justify-around px-2
                pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1">
      {#each navLinks as link}
        {@const active = isActive(link.href, $page.url.pathname)}
        <a
          href={link.href}
          class="flex flex-col items-center gap-0.5 py-1 px-3 rounded-md text-xs transition-colors
                 {active ? 'text-accent font-medium' : 'text-muted-contrast hover:text-canvas-contrast'}"
        >
          <span class="text-sm leading-none">
            {#if link.label === 'dashboard'}⬡
            {:else if link.label === 'backups'}⊚
            {:else if link.label === 'settings'}⊛
            {:else}⊟{/if}
          </span>
          <span>{link.label}</span>
        </a>
      {/each}
    </nav>
  </div>
</AtomForge>
