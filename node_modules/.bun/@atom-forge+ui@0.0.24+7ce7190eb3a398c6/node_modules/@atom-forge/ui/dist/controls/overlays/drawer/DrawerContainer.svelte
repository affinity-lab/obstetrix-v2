<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getDrawerManager } from './drawer-manager.svelte';
	import Drawer from './Drawer.svelte';

	const drawerManager = getDrawerManager();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			const lastDrawer = drawerManager.drawers[drawerManager.drawers.length - 1];
			if (lastDrawer?.options.closable) {
				drawerManager.close();
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			const lastDrawer = drawerManager.drawers[drawerManager.drawers.length - 1];
			if (lastDrawer?.options.closable) {
				e.preventDefault();
				drawerManager.close();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown}/>
<!-- Backdrop -->
{#if drawerManager.drawers.length > 0}
	<div
		role="none"
		class="fixed inset-0 z-9998 bg-black/50 backdrop-blur-xs"
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
	></div>
{/if}

<!-- Drawers -->
{#each drawerManager.drawers as drawer, i (i)}
	<Drawer
		position={drawer.options.position || 'right'}
		size={drawer.options.size || 'md'}
	>
		{@const Component = drawer.component}
		<Component {...drawer.props}/>
	</Drawer>
{/each}
