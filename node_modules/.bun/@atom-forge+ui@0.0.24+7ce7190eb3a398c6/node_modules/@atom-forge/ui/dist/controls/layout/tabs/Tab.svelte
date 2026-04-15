<script lang="ts">
	import type {ChildrenProp} from "../../../index";
	import {Icon, type IconDefinition} from "../../general/icon";
	import type {TabsVariant} from './Tabs.svelte';
	import {getContext} from 'svelte';
	import {twMerge} from 'tailwind-merge';

	let {
		id,
		icon,
		children
	}: ChildrenProp & {
		id: string
		icon?: IconDefinition
	} = $props();

	const context = getContext<{ isActive: (id: string) => boolean; selectTab: (id: string) => void; variant: TabsVariant }>('tabs-context');
	const isLine = context.variant === 'line';
	const isActive = $derived(context.isActive(id));

	const classes = $derived(twMerge(
		'flex items-center gap-2 transition-all duration-150 cursor-pointer',
		isLine  && 'px-4 py-2 -mb-px text-sm font-medium border-b-2',
		!isLine && 'px-3 py-1 rounded-control text-sm',
		isLine  &&  isActive && 'border-accent text-canvas-contrast',
		isLine  && !isActive && 'border-transparent text-muted-contrast hover:text-canvas-contrast',
		!isLine &&  isActive && 'bg-surface text-surface-contrast shadow-sm',
		!isLine && !isActive && 'text-muted-contrast hover:bg-secondary/50',
	));
</script>

<button class={classes} onclick={() => context.selectTab(id)}>
	{#if icon}
		<Icon {icon} size="5"/>
	{/if}
	{@render children()}
</button>
