<script lang="ts">
	import type {AnyProp, ChildrenProp, ClassProp} from "../../../index";
	import {twMerge} from 'tailwind-merge';

	type Elevate = 0 | 1 | 2 | 3 | 4 | 5 | 6 | "0" | "1" | "2" | "3" | "4" | "5" | "6";

	let {
		children,
		class: classes = '',
		elevate = 1,
		...props
	}: & ChildrenProp
		& ClassProp
		& AnyProp
		& { elevate?: Elevate } = $props();

	const effectiveShadowClass = $derived(['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'][typeof elevate === 'string' ? parseInt(elevate) : elevate])
</script>
<div class={twMerge("rounded-surface bg-surface border border-frame text-surface-contrast overflow-hidden", effectiveShadowClass, classes)}
     {...props}>
	{@render children()}
</div>
