<script lang="ts">
	import type {AnyProp, ClassProp, XOR} from "../../../index";
	import {untrack} from "svelte";
	import {twMerge} from "tailwind-merge";
	import {IconDefiner, type IconDefinition} from "./icon-definition";

	let {
		icon,
		size,
		pxSize,
		stroke: strokeProp,
		class: classes,
		...props
	}: & ClassProp
		& AnyProp
		& XOR<{ size: number | `${number}` }, { pxSize: number | `${number}` }, {}>
		& {
		icon: IconDefinition
		stroke?: number | `${number}`
	} = $props();

	const stroke = untrack(() => icon instanceof IconDefiner ?
		icon.stroke :
		strokeProp
			? parseInt(strokeProp + "")
			: 4)

	const strokeWidth: string = untrack(() => (0.5 + (stroke - 1) * 0.25).toString())
	pxSize = untrack(() => typeof pxSize !== "number" && pxSize ? parseInt(pxSize) : pxSize);
	size = untrack(() => typeof size !== "number" && size ? parseInt(size) : size);
	pxSize = untrack(() => size === undefined && pxSize === undefined ? 20 : pxSize ?? (size ? size * 4 : 20));
</script>

{#if icon}
	{@const Component = icon instanceof IconDefiner ? icon.component : icon}
	<Component size={pxSize}
	           class={icon instanceof IconDefiner ? twMerge(classes, icon.classes) : classes}
	           stroke={strokeWidth}
	           strokeWidth={strokeWidth}
	           {...props}
	/>
{/if}
