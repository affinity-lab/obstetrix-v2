<script lang="ts">
	import {createAccordionManager} from './accordion-manager.svelte';
	import type {AnyProp, ChildrenProp, ClassProp, XOR} from "../../../helpers/types";
	import {untrack} from 'svelte';
	import {twMerge} from "tailwind-merge";

	let {
		multiple,
		compact,
		borderless,
		joined,
		small,
		class: classes,
		children,
		...props
	}: & ClassProp
		& AnyProp
		& ChildrenProp
		& XOR<{ small: true }, { compact: true }, {}>
		& {
		multiple?: boolean
		borderless?: boolean
		joined?: boolean
	} = $props();

	createAccordionManager(
		untrack(() => !!multiple),
		untrack(() => small ? 'small' : compact ? 'compact' : 'normal'),
		untrack(() => !!borderless),
		untrack(() => !!joined)
	);

	const wrapperClass = $derived(twMerge(
		'w-full',
		joined  && 'border border-frame rounded-surface overflow-hidden divide-y divide-border',
		!joined && 'space-y-2',
		classes
	));
</script>

<div class={wrapperClass} {...props}>
	{@render children()}
</div>
