<script lang="ts">
	import type {ClassProp, XOR} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";
	import Avatar from "../avatar/Avatar.svelte";

	type AvatarItem = { name?: string; src?: string; color?: string };

	let {
		avatars,
		max = 5,
		compact,
		small,
		micro,
		class: classes,
	}: ClassProp
		& XOR<{}, { compact: true }, { small: true }, { micro: true }>
		& {
		avatars: AvatarItem[]
		max?: number
	} = $props();

	const visible = $derived(avatars.slice(0, max));
	const overflow = $derived(avatars.length - max);

	const sizeClass = $derived(
		micro   ? 'h-5 w-5 text-[9px]'  :
		small   ? 'h-6 w-6 text-[10px]' :
		compact ? 'h-8 w-8 text-xs'     :
		          'h-10 w-10 text-sm'
	);

	const sizeProps = $derived(
		compact ? {compact: true as const} :
		small   ? {small: true as const}   :
		micro   ? {micro: true as const}   :
		{}
	);
</script>

<div class={twMerge('flex items-center', classes)}>
	{#each visible as avatar, i}
		<div class="-ml-1.5 first:ml-0 ring-2 ring-[var(--color-canvas)] rounded-full">
			<Avatar name={avatar.name} src={avatar.src} color={avatar.color} {...sizeProps}/>
		</div>
	{/each}
	{#if overflow > 0}
		<div class={twMerge(
			'-ml-1.5 rounded-full ring-2 ring-[var(--color-canvas)] flex items-center justify-center bg-secondary text-canvas-contrast font-bold shrink-0 select-none',
			sizeClass
		)}>+{overflow}</div>
	{/if}
</div>
