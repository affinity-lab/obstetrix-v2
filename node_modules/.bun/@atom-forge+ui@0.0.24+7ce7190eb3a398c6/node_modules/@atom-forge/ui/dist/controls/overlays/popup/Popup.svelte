<script lang="ts">
	import {onMount} from "svelte";
	import {fade} from "svelte/transition";
	import {getPopupManager} from "./popup-manager.svelte";

	let {children}: { children: any } = $props();
	const popupManager = getPopupManager();

	let style = $state('');
	const OFFSET = 4;

	onMount(() => {
		if (popupManager.popup!.anchor) {
			let rafId: number;
			function updatePos() {
				if (popupManager.popup?.anchor) {
					style = calculateAnchoredPosition(popupManager.popup!.anchor!.getBoundingClientRect());
					rafId = requestAnimationFrame(updatePos);
				}
			}
			rafId = requestAnimationFrame(updatePos);
			return () => cancelAnimationFrame(rafId);
		} else {
			style = calculateMousePosition(popupManager.popup!.event!.clientX, popupManager.popup!.event!.clientY);
		}
	})

	function getQuadrant(x: number, y: number) {
		if (x < window.innerWidth / 2 && y < window.innerHeight / 2) return {top: true, left: true, bottom: false, right: false};
		if (x >= window.innerWidth / 2 && y < window.innerHeight / 2) return {top: true, left: false, bottom: false, right: true};
		if (x < window.innerWidth / 2 && y >= window.innerHeight / 2) return {top: false, left: true, bottom: true, right: false};
		return {top: false, left: false, bottom: true, right: true};
	}

	function makeStyle(top: number | null, bottom: number | null, left: number | null, right: number | null, minWidth: number | null) {
		return [
			top !== null ? `top: ${top}px` : '',
			bottom !== null ? `bottom: ${bottom}px` : '',
			left !== null ? `left: ${left}px` : '',
			right !== null ? `right: ${right}px` : '',
			minWidth !== null ? `min-width: ${minWidth}px` : '',
		].filter(Boolean).join('; ');
	}

	function calculateAnchoredPosition(anchorRect: DOMRect) {
		const popup = popupManager.popup;
		let
			top: number | null = null,
			bottom: number | null = null,
			left: number | null = null,
			right: number | null = null,
			minWidth: number | null = null;

		if (popup && popup.anchor) {
			const offset = popup.offset || OFFSET;
			const quadrant = getQuadrant(anchorRect.left + anchorRect.width / 2, anchorRect.top + anchorRect.height / 2);

			if (popup.align === 'side') {
				if (quadrant.left) left = anchorRect.right + offset;
				else right = window.innerWidth - anchorRect.left + offset;
				if (quadrant.top) top = anchorRect.top;
				else bottom = window.innerHeight - anchorRect.bottom;
			} else {
				if (quadrant.top) top = anchorRect.bottom + offset;
				else bottom = window.innerHeight - anchorRect.top + offset;
				if (popup.align === 'left') left = anchorRect.left;
				else if (popup.align === 'right') right = window.innerWidth - anchorRect.right;
				else if (quadrant.left) left = anchorRect.left;
				else right = window.innerWidth - anchorRect.right;
				if (popup.align === 'both') minWidth = anchorRect.width;
			}

		}
		return makeStyle(top, bottom, left, right, minWidth);
	}

	function calculateMousePosition(x: number, y: number) {
		const popup = popupManager.popup;
		let
			top: number | null = null,
			bottom: number | null = null,
			left: number | null = null,
			right: number | null = null,
			minWidth: number | null = null;

		if (popup) {
			const quadrant = getQuadrant(x, y);

			if (quadrant.top) top = y + OFFSET;
			else bottom = window.innerHeight - y + OFFSET;

			if (quadrant.left) left = x + OFFSET;
			else right = window.innerWidth - x + OFFSET;
		}

		return makeStyle(top, bottom, left, right, minWidth);
	}
</script>

<div role="none"
     class="z-[9999] fixed transition-top duration-top-16 transition-bottom duration-bottom-16"
     style={style}
     onclick={(e) => e.stopPropagation()}
     oncontextmenu={(e) => e.stopPropagation()}
     transition:fade={{duration: 150}}
>
	{@render children()}
</div>
