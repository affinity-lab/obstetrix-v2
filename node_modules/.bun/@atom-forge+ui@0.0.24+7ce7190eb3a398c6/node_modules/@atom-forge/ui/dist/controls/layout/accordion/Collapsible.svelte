<script lang="ts">
	import { createAccordionManager } from './accordion-manager.svelte';
	import AccordionItem from './AccordionItem.svelte';
	import type { AnyProp, ChildrenProp, ClassProp, XOR } from "../../../helpers/types";
	import { type IconDefinition } from "../../general/icon";
	import { untrack } from 'svelte';

	let {
		title,
		icon,
		open = $bindable(false),
		compact,
		small,
		borderless,
		class: classes,
		children,
		...props
	}: & ChildrenProp
		& ClassProp
		& AnyProp
		& XOR<{}, { compact: true }, { small: true }>
		& {
		title: string
		icon?: IconDefinition
		open?: boolean
		borderless?: boolean
	} = $props();

	const ITEM_ID = 'collapsible';
	const manager = createAccordionManager(
		false,
		untrack(() => small ? 'small' : compact ? 'compact' : 'normal'),
		untrack(() => !!borderless),
		false
	);

	// Initial open state
	if (untrack(() => open)) manager.activeItems = new Set([ITEM_ID]);

	// manager → open: when user clicks the header
	$effect(() => {
		const active = manager.isItemActive(ITEM_ID);
		if (active !== untrack(() => open)) open = active;
	});

	// open → manager: when open is set externally
	$effect(() => {
		const o = open;
		if (o !== untrack(() => manager.isItemActive(ITEM_ID))) {
			manager.activeItems = new Set(o ? [ITEM_ID] : []);
		}
	});
</script>

<AccordionItem {title} {icon} id={ITEM_ID} class={classes} {...props}>
	{@render children()}
</AccordionItem>
