<script lang="ts">
  import {
    createModalManager,  ModalContainer,
    createPopupManager,  PopupContainer,
    createToastManager,  ToastContainer,
    createDrawerManager, DrawerContainer,
  } from '@atom-forge/ui';
  import { onMount } from 'svelte';

  let { dark = false, light = false, children } = $props<{
    dark?: boolean;
    light?: boolean;
    children?: import('svelte').Snippet;
  }>();

  let isInitialized = $state(false);

  onMount(() => {
    const saved = localStorage.getItem('dark');
    const useDark = saved !== null
      ? JSON.parse(saved)
      : light ? false : (window.matchMedia('(prefers-color-scheme: dark)').matches || dark);
    document.documentElement.classList.toggle('dark', useDark);
    document.body.style.background = 'var(--color-canvas)';
    document.body.style.color = 'var(--color-canvas-contrast)';
    localStorage.setItem('dark', JSON.stringify(useDark));
    requestAnimationFrame(() => { isInitialized = true; });
  });

  createModalManager();
  createPopupManager();
  createToastManager();
  createDrawerManager();
</script>

<div style="display: contents;">
  {#if isInitialized}
    {@render children?.()}
  {/if}
  <div id="atom-forge-portal-target" class="relative z-10000"></div>
  <ModalContainer />
  <PopupContainer />
  <ToastContainer />
  <DrawerContainer />
</div>
