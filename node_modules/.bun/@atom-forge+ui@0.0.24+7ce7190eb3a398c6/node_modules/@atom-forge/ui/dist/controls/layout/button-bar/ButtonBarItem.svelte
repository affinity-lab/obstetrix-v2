<script lang="ts">
	import type {AnyProp, ChildrenProp, ClassProp} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";

	let {
		children,
		class: classes = '',
		...props
	}: ChildrenProp & ClassProp & AnyProp = $props();
</script>

<div class={twMerge('flex items-center self-stretch bg-secondary px-2', classes)} {...props}>
	{@render children()}
</div>
