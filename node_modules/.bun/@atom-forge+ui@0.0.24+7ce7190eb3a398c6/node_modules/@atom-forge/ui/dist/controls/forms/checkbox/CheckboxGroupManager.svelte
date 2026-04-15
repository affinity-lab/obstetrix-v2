<script lang="ts">
	import {createCheckboxGroupManager} from './checkbox-group-manager.svelte';
	import type {ChildrenProp} from "../../../helpers/types";

	let {children}: ChildrenProp = $props();
	createCheckboxGroupManager()
</script>

{@render children()}
