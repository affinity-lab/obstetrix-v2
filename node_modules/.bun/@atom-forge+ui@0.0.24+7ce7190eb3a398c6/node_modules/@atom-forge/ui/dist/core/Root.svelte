<script lang="ts">
	import {createDrawerManager, createModalManager, createPopupManager, createToastManager, DrawerContainer, ModalContainer, PopupContainer, ToastContainer} from "../index";
	import type {ChildrenProp} from "../helpers/types";
	import {createThemeManager} from "./theme-manager.svelte";
	import {onMount} from "svelte";

	let {
		children
	}: & ChildrenProp = $props();

	const themeManager = createThemeManager();

	onMount(() => {
		// Initialize themeManager.dark based on the class set by the no-flash script
		themeManager.dark = document.documentElement.classList.contains('dark');
	});

	$effect(() => {
		document.documentElement.classList.toggle('dark', themeManager.dark);
		document.body.style.background = 'var(--color-canvas)';
		document.body.style.color = 'var(--color-canvas-contrast)';
		localStorage.setItem('dark', JSON.stringify(themeManager.dark));
	});

	createModalManager();
	createPopupManager();
	createToastManager();
	createDrawerManager();
</script>

<div style="display: contents;">
	{@render children?.()}
</div>
<div id="atom-forge-portal-target" class="relative z-10000"></div>
<ModalContainer/>
<PopupContainer/>
<ToastContainer/>
<DrawerContainer/>
