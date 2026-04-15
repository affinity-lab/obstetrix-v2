<script lang="ts">
	import type {ChildrenProp, ClassProp} from "../../../index";
	import {getContext} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import type {TabsVariant} from './Tabs.svelte';

	let {
		children,
		class: classes
	}: & ChildrenProp
		& ClassProp = $props();

	const context = getContext<{ variant: TabsVariant }>('tabs-context');
</script>

<div class={twMerge(
	"flex",
	context.variant === 'line' && 'border-b border-frame',
	context.variant === 'button' && 'gap-1 bg-secondary p-1 rounded-surface',
	classes
)}>
	{@render children()}
</div>
