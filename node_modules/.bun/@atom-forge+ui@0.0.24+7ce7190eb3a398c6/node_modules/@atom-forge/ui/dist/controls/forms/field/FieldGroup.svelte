<script lang="ts">
	import {twMerge} from 'tailwind-merge';
	import type {ChildrenProp, ClassProp} from '../../../helpers/types';

	let {
		labelWidth = 'auto',
		children,
		class: classes,
	}: ChildrenProp & ClassProp & {
		labelWidth?: string;
	} = $props();
</script>

<!--
	Creates a two-column CSS grid.
	- col 1: label cells (Field horizontal → label)
	- col 2: control cells (Field horizontal → input+meta)
	- vertical Fields and FieldSpans span both columns automatically.
-->
<div
	class={twMerge('grid gap-x-4 gap-y-3 items-start', classes)}
	style="grid-template-columns: {labelWidth === 'auto' ? 'max-content' : labelWidth} 1fr;"
>
	{@render children()}
</div>

