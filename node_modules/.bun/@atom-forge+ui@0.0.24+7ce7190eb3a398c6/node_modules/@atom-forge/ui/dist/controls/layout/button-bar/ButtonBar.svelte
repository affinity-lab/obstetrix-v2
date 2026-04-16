<script lang="ts">
	import type {AnyProp, ClassProp} from "../../../helpers/types";
	import type {Snippet} from 'svelte';
	import {twMerge} from 'tailwind-merge';

	let {
		class: classes = '',
		children,
		...props
	}: ClassProp & AnyProp & { children?: Snippet } = $props();
</script>

<span class={twMerge(
	'inline-flex items-center gap-px rounded-surface bg-secondary border border-frame overflow-hidden',
	classes
)} {...props}>
	{@render children?.()}
</span>

<style>
	span > :global(*) {
		border-radius: 0 !important;
		border-width: 0 !important;
		box-shadow: none !important;
	}
</style>
