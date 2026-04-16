<script lang="ts">
	import type {AnyProp, ChildrenProp} from "../../../index";
	import {getContext} from 'svelte';

	let {
		id,
		children,
		...props
	}: & ChildrenProp
		& AnyProp
		& {
		id: string
	} = $props();

	const context = getContext<any>('tabs-context');
	const isActive = $derived(context.isActive(id));
</script>

{#if isActive}
	<div {...props}>
		{@render children()}
	</div>
{/if}
