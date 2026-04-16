<script lang="ts">
	import type {ChildrenProp, ClassProp} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";

	let {
		count,
		dot = false,
		max = 99,
		color = 'accent',
		hidden = false,
		class: classes,
		children,
	}: ChildrenProp & ClassProp & {
		count?: number
		dot?: boolean
		max?: number
		color?: 'accent' | 'red' | 'green' | 'blue'
		hidden?: boolean
	} = $props();

	const colorClass = $derived({
		accent: 'bg-accent text-accent-contrast',
		red:    'bg-red-500 text-white',
		green:  'bg-green-500 text-white',
		blue:   'bg-blue-500 text-white',
	}[color]);

	const label = $derived(
		dot ? '' : count !== undefined ? (count > max ? `${max}+` : String(count)) : ''
	);

	const visible = $derived(!hidden && (dot || (count !== undefined && count > 0)));
</script>

<div class={twMerge('relative inline-flex', classes)}>
	{@render children()}
	{#if visible}
		<span class="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none z-10
			{colorClass}
			{dot ? 'h-2.5 w-2.5 rounded-full' : 'h-4 min-w-4 px-1 rounded-full text-[10px] font-bold leading-none'}
		">{label}</span>
	{/if}
</div>
