<script lang="ts">
	import {untrack} from "svelte";
	import {createPopupManager, getPopupManager} from "./popup-manager.svelte";
	import Popup from "./Popup.svelte";

	let {children}: { children?: any } = $props();

	const isScoped = untrack(() => !!children);
	let rootManager = getPopupManager();

	if (!rootManager && !isScoped) {
		throw new Error("No global PopupManager found and the PopupContainer is not scoped! Please add a scoped PopupContainer or initialize a global PopupManager.");
	}

	let manager = isScoped ? createPopupManager(rootManager) : rootManager;
</script>

<div class="contents">
	{#if isScoped}
		{@render children()}
	{/if}
</div>

<svelte:window onclick={() => manager.close()} oncontextmenu={() => manager.close()}/>

{#if manager?.popup}
	{@const Component = manager.popup.component}
	{@const params = manager.popup.params}
	<Popup>
		<Component {...params}/>
	</Popup>
{/if}
