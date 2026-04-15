<script lang="ts">
	import type {ChildrenProp, ClassProp} from "../../../index";
	import {fade} from 'svelte/transition';
	import {twMerge} from 'tailwind-merge';
	import type {Snippet} from "svelte";

	let {
		label,
		children,
		content,
		delay = 1000,
		immediate = false,
		inverted = false,
		fixed = false,
		class: classes
	}: & ChildrenProp
		& ClassProp
		& {
		label?: string
		content?: Snippet
		delay?: number
		immediate?: boolean
		inverted?: boolean
		fixed?: boolean
	} = $props();

	const resolvedDelay = $derived(immediate ? 0 : delay);

	let show = $state(false);
	let style = $state('');
	let mousePos = $state({x: 0, y: 0});
	const OFFSET_Y_DOWN = 16;
	const OFFSET_X_LEFT = 16;
	const OFFSET_X_RIGHT = -16;
	const OFFSET_Y_UP = 8;
	const FIXED_GAP = 6;
	let showTimeout: number;
	let willShow = $state(false);
	let triggerEl = $state<HTMLSpanElement | undefined>(undefined);

	function handleMouseEnter(event: MouseEvent) {
		mousePos = {x: event.clientX, y: event.clientY};
		willShow = true;
		showTimeout = window.setTimeout(() => { show = true; }, resolvedDelay);
	}

	function handleMouseLeave() {
		clearTimeout(showTimeout);
		show = false;
		willShow = false;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!fixed) mousePos = {x: event.clientX, y: event.clientY};
	}

	/**
	 * A portal action that moves the node to the document.body
	 */
	function portal(node: HTMLElement, target: string = 'body') {
		let targetEl: HTMLElement | null;

		targetEl = document.querySelector(target);
		if (!targetEl) {
			targetEl = document.body;
		}

		targetEl.appendChild(node);

		return {
			destroy() {
				if (targetEl && targetEl.contains(node)) {
					targetEl.removeChild(node);
				}
			}
		};
	}

	$effect(() => {
		if (willShow) {
			if (show) {
				if (fixed && triggerEl) {
					const rect = triggerEl.getBoundingClientRect();
					const {innerWidth: vpWidth, innerHeight: vpHeight} = window;
					const cx = rect.left + rect.width / 2;
					const below = rect.bottom + FIXED_GAP;
					const above = vpHeight - rect.top + FIXED_GAP;

					let top: string | null = null;
					let bottom: string | null = null;
					let left: string | null = null;
					let right: string | null = null;
					let transform = '';

					// vertical: prefer below, flip above if not enough space
					if (rect.bottom + 40 < vpHeight) {
						top = `${below}px`;
					} else {
						bottom = `${above}px`;
					}

					// horizontal: center on trigger, flip if near edge
					if (cx < vpWidth / 2) {
						left = `${rect.left}px`;
					} else {
						right = `${vpWidth - rect.right}px`;
					}

					style = [
						top    ? `top: ${top}`       : '',
						bottom ? `bottom: ${bottom}` : '',
						left   ? `left: ${left}`     : '',
						right  ? `right: ${right}`   : '',
						transform ? `transform: ${transform}` : '',
					].filter(Boolean).join('; ');
				} else {
					const {x, y} = mousePos;
					const {innerWidth: vpWidth, innerHeight: vpHeight} = window;

					let top: string | null = null;
					let bottom: string | null = null;
					let left: string | null = null;
					let right: string | null = null;

					if (y < vpHeight / 2) {
						top = `${y + OFFSET_Y_DOWN}px`;
					} else {
						bottom = `${vpHeight - y + OFFSET_Y_UP}px`;
					}

					if (x < vpWidth / 2) {
						left = `${x + OFFSET_X_RIGHT}px`;
					} else {
						right = `${vpWidth - x - OFFSET_X_LEFT}px`;
					}

					style = [
						top    ? `top: ${top}`       : '',
						bottom ? `bottom: ${bottom}` : '',
						left   ? `left: ${left}`     : '',
						right  ? `right: ${right}`   : '',
					].filter(Boolean).join('; ');
				}
			}
		}
	});
</script>

<span
	bind:this={triggerEl}
	role="none"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onmousemove={handleMouseMove}
	class={twMerge("inline-block", classes)}
>
	{@render children()}
</span>

{#if show && (label || content)}
	<div
		use:portal={"#atom-forge-portal-target"}
		class={twMerge(
			"fixed z-10000 px-2 py-1 text-xs rounded-surface shadow-lg",
			inverted
				? "bg-primary text-primary-contrast border-transparent"
				: "bg-surface border border-frame text-surface-contrast"
		)}
		style={style}
		transition:fade={{ duration: 150 }}
	>
		{#if content}
			{@render content()}
		{:else}
			{label}
		{/if}
	</div>
{/if}
