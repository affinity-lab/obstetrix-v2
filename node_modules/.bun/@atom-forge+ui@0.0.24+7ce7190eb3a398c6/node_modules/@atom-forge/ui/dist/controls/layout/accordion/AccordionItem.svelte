<script lang="ts">
	import {getAccordionManager} from './accordion-manager.svelte';
	import {Icon, type IconDefinition} from "../../general/icon";
	import type {AnyProp, ChildrenProp, ClassProp} from "../../../helpers/types";
	import {ChevronDown} from "lucide-svelte";
	import {slide} from 'svelte/transition';
	import {twMerge} from 'tailwind-merge';

	let {
		title,
		icon,
		id = Math.random().toString(36).slice(2),
		children,
		class: classes,
		...props
	}: & ChildrenProp
		& ClassProp
		& AnyProp
		& {
		title: string
		icon?: IconDefinition
		id?: string
	} = $props();

	const manager = getAccordionManager();

	const isOpen = $derived(manager.isItemActive(id));

	const wrapperClass = $derived(twMerge(
		'overflow-hidden',
		!manager.borderless && !manager.joined && 'border border-frame rounded-surface',
	));

	const buttonClass = $derived(twMerge(
		'w-full flex justify-between items-center text-left font-medium text-canvas-contrast bg-secondary/50 hover:bg-secondary transition-colors',
		manager.size === 'normal'  && 'p-4',
		manager.size === 'compact' && 'p-2 text-sm',
		manager.size === 'small'   && 'p-1 px-2 text-xs',
		classes,
	));

	const contentClass = $derived(twMerge(
		(manager.joined || !manager.borderless) && 'border-t border-frame',
	));
</script>

<div class={wrapperClass} {...props}>
	<button class={buttonClass} onclick={() => manager.toggleItem(id)}>
		<span class="flex items-center gap-2">
			{#if icon}<Icon icon={icon} size="5"/>{/if}
			<span>{title}</span>
		</span>
		<span class="transition-transform duration-200" class:rotate-180={isOpen}>
			<Icon icon={ChevronDown} size="5"/>
		</span>
	</button>
	{#if isOpen}
		<div class={contentClass} transition:slide={{ duration: 200 }}>
			{@render children()}
		</div>
	{/if}
</div>
