<script lang="ts">
	import type { DrawerPosition, DrawerSize } from './drawer-manager.svelte';
	import type { ChildrenProp } from '../../../helpers/types';
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';

	let {
		position,
		size,
		children
	}: ChildrenProp & {
		position: DrawerPosition;
		size: DrawerSize;
	} = $props();

	function trueSlide(
		node: Element,
		{ axis = 'x', duration = 300 }: { axis?: 'x' | 'y'; duration?: number } = {}
	): TransitionConfig {
		const style = getComputedStyle(node);
		const opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const width = (node as HTMLElement).offsetWidth;
		const height = (node as HTMLElement).offsetHeight;
		const primary_property_value = axis === 'y' ? height : width;
		const start = position === 'left' ? -primary_property_value : primary_property_value;

		return {
			delay: 0,
			duration,
			easing: cubicOut,
			css: (t, u) =>
				`transform: ${transform} translate${axis.toUpperCase()}(${u * start}px); opacity: ${t * opacity};`
		};
	}

</script>

<div
	class="fixed top-0 bottom-0 z-9999 bg-surface border-l border-frame shadow-2xl flex flex-col"
	class:border-l={position === 'right'}
	class:border-r={position === 'left'}
	class:border-r-0={position === 'right'}
	class:left-0={position === 'left'}
	class:right-0={position === 'right'}
	class:w-96={size === 'sm'}
	class:w-128={size === 'md'}
	class:w-192={size === 'lg'}
	class:w-full={size === 'full'}
	transition:trueSlide={{ axis: 'x', duration: 300 }}
>
	{@render children()}
</div>
