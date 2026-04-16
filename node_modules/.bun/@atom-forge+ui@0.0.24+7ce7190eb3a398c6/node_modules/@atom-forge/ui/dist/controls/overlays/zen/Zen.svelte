<script lang="ts">
	import {fade} from 'svelte/transition';
	import {twMerge} from 'tailwind-merge';
	import type {ClassProp} from '../../../helpers/types';
	import type {Snippet} from 'svelte';
	import {Icon} from '../../general/icon';
	import {X} from 'lucide-svelte';

	let {
		active          = $bindable(false),
		closeOnEsc      = true,
		closeOnBackdrop = true,
		children,
		title,
		closeButton,
		class: classes,
		zenClass,
		backdropClass,
	}: ClassProp & {
		active?:          boolean;
		closeOnEsc?:      boolean;
		closeOnBackdrop?: boolean;
		children:         Snippet;
		title?:           string;
		closeButton?:     Snippet<[{ close: () => void }]>;
		backdropClass?:   string;
		zenClass?:        string;
	} = $props();

	function close() { active = false; }

	function onBackdropClick(e: MouseEvent) {
		if (closeOnBackdrop && e.target === e.currentTarget) close();
	}

	function onKeydown(e: KeyboardEvent) {
		if (closeOnEsc && e.key === 'Escape') { e.preventDefault(); close(); }
	}

	$effect(() => {
		if (!active) return;
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow     = 'hidden';
		document.body.style.paddingRight = `${scrollbarWidth}px`;
		return () => {
			document.body.style.overflow     = '';
			document.body.style.paddingRight = '';
		};
	});
</script>

<svelte:window onkeydown={onKeydown}/>

{#if active}
	<div
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		class={twMerge('fixed inset-0 z-9998 bg-canvas/80 backdrop-blur-sm', backdropClass)}
		transition:fade={{ duration: 200 }}
		onclick={onBackdropClick}
		onkeydown={onKeydown}
	>
		<!-- close button — always top-right of the overlay -->
		<div class="absolute top-4 right-4 z-10">
			{#if closeButton}
				{@render closeButton({ close })}
			{:else}
				<button
					type="button"
					onclick={close}
					class="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
					aria-label="Close zen mode"
				>
					<Icon icon={X} size="4"/>
				</button>
			{/if}
		</div>

		<div
			class={twMerge('relative flex flex-col w-full h-full', zenClass)}
			role="none"
		>
			<!-- main content area — grows, centres vertically -->
			<div class="flex-1 flex flex-col items-center justify-center w-full overflow-y-auto p-8 min-h-0">
				<div class="flex flex-col w-full max-w-3xl">
					{@render children()}
				</div>
			</div>

			<!-- title strip -->
			{#if title}
				<div class="flex items-center justify-center backdrop-blur-sm shrink-0 py-3">
					<span class="text-sm font-medium bg-secondary text-secondary-contrast px-3 py-1 rounded-full border border-frame">{title}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}
