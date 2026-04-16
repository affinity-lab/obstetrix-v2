<script lang="ts">
	import {fade} from 'svelte/transition';
	import {getModalManager} from './modal-manager.svelte';

	const modalManager = getModalManager();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			modalManager.close(); // Alapértelmezetten 'undefined' értékkel zár be
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			modalManager.close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown}/>

{#if modalManager.modals.length > 0}
	<div role="none"
	     onwheel={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
	     ontouchmove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
	     class="fixed inset-0 z-[9999] bg-canvas/80 backdrop-blur-xs"
	     transition:fade={{ duration: 150 }}
	>
		{#each modalManager.modals as modal, i (i)}
			{@const Component = modal.component}
			{@const props = modal.props}
			<div role="none"
			     class="fixed inset-0 flex flex-row items-center justify-center"
			     onclick={handleBackdropClick}
			     ondblclick={e=>e.preventDefault()}
			     transition:fade>
				<div class="transition-all duration-300 "
				     class:translate-y-10={modalManager.modals.length - i === 2}
				     class:translate-y-16={modalManager.modals.length - i === 3}
				     class:translate-y-20={modalManager.modals.length - i === 4}
				     class:translate-y-22={modalManager.modals.length - i > 4}
				     class:scale-95={modalManager.modals.length - i === 2}
				     class:scale-90={modalManager.modals.length - i === 3}
				     class:scale-85={modalManager.modals.length - i === 4}
				     class:scale-80={modalManager.modals.length - i > 4}
				     class:opacity-0={modalManager.modals.length - i > 4}
				     class:brightness-75={i !== modalManager.modals.length -1}
				     class:blur-[2px]={i !== modalManager.modals.length -1}
				     class:hidden={modalManager.modals.length - i > 4}
				>
					<Component {...props}/>
				</div>
			</div>
		{/each}
	</div>
{/if}