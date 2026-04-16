<script lang="ts">
	import type {AnyProp, ChildrenProp, ClassProp} from "../../../index";
	import {Icon, type IconDefinition} from "../icon";
	import type {Snippet} from 'svelte';
	import {twMerge} from "tailwind-merge";

	let {
		color = 'base',
		icon,
		children,
		start,
		end,
		class: classes,
		...rest
	}: ChildrenProp & ClassProp & AnyProp & {
		color?: 'base' | 'green' | 'red' | 'blue' | 'yellow'
		icon?: IconDefinition
		start?: Snippet
		end?: Snippet
	} = $props();

	const colorClass = $derived({
		base:   'bg-secondary text-secondary-contrast',
		green:  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
		red:    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
		blue:   'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
		yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
	}[color]);
</script>

<span class={twMerge(
	'inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium',
	colorClass,
	classes,
)} {...rest}>
	{#if start}
		{@render start()}
	{:else if icon}
		<Icon {icon} size="3"/>
	{/if}

	{@render children()}

	{#if end}
		{@render end()}
	{/if}
</span>
