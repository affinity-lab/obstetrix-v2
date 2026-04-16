<script lang="ts">
	import Tooltip from "../../overlays/tooltip/Tooltip.svelte";
	import type {ClassProp, XOR} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";

	let {
		name,
		src,
		color,
		tooltip = false,
		compact,
		small,
		micro,
		class: classes,
	}: ClassProp
		& XOR<{}, { compact: true }, { small: true }, { micro: true }>
		& {
		name?: string
		src?: string
		color?: string
		tooltip?: boolean
	} = $props();

	const COLORS = [
		'bg-blue-500/20 text-blue-600',
		'bg-green-500/20 text-green-600',
		'bg-purple-500/20 text-purple-600',
		'bg-orange-500/20 text-orange-600',
		'bg-teal-500/20 text-teal-600',
		'bg-red-500/20 text-red-600',
		'bg-yellow-500/20 text-yellow-600',
		'bg-pink-500/20 text-pink-600',
		'bg-indigo-500/20 text-indigo-600',
		'bg-cyan-500/20 text-cyan-600',
	];

	function hashColor(str: string): string {
		let h = 0;
		for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
		return COLORS[Math.abs(h) % COLORS.length];
	}

	function initials(str: string): string {
		return str.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
	}

	const resolvedColor = $derived(color ?? (name ? hashColor(name) : COLORS[0]));
	const resolvedInitials = $derived(name ? initials(name) : '?');

	const sizeClass = $derived(
		micro   ? 'h-5 w-5 text-[9px]'  :
		small   ? 'h-6 w-6 text-[10px]' :
		compact ? 'h-8 w-8 text-xs'     :
		          'h-10 w-10 text-sm'
	);

	const avatarClasses = $derived(twMerge(
		'rounded-full font-bold flex items-center justify-center shrink-0 select-none overflow-hidden bg-secondary',
		sizeClass,
		classes,
	));
</script>

{#if tooltip && name}
	<Tooltip label={name} inverted delay={300}>
		<div class={avatarClasses}>
			{#if src}
				<img {src} alt={name ?? ''} class="w-full h-full object-cover"/>
			{:else}
				<span class={twMerge('w-full h-full flex items-center justify-center', resolvedColor)}>
					{resolvedInitials}
				</span>
			{/if}
		</div>
	</Tooltip>
{:else}
	<div class={avatarClasses}>
		{#if src}
			<img {src} alt={name ?? ''} class="w-full h-full object-cover"/>
		{:else}
			<span class={twMerge('w-full h-full flex items-center justify-center', resolvedColor)}>
				{resolvedInitials}
			</span>
		{/if}
	</div>
{/if}
