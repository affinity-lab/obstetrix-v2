<script lang="ts">
	import type {AnyProp, ChildrenProp, ClassProp} from "../../../index";
	import {createRadioGroupManager} from "./radio-group-manager.svelte";
	import {untrack} from "svelte";

	let {
		value = $bindable(),
		size: _size,
		primary,
		accent,
		children,
		class: classes,
		...props
	}: & ClassProp
		& AnyProp
		& ChildrenProp
		& {
		size?: 'small' | 'compact' | 'normal'
		primary?: boolean
		accent?: boolean
		value: any
	} = $props();

	const size = untrack(() => _size);
	const variant = untrack(() => primary ? 'primary' : accent ? 'accent' : 'default') as 'default' | 'primary' | 'accent';
	const manager = createRadioGroupManager(value, size, variant);
	$effect(() => {
		value = manager.value
	});
	$effect(() => {
		manager.value = value
	});
</script>
<div class={classes} {...props}>
	{@render children()}
</div>
