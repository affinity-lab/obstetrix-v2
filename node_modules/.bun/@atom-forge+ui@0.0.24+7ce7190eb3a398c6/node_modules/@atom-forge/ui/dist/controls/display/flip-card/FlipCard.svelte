<script lang="ts">
	import {type ClassProp, getThemeManager, type XOR} from "../../../index";
	import {twMerge} from "tailwind-merge";
	import {type Snippet, untrack} from 'svelte';

	type Trigger = 'hover' | 'click' | 'manual';
	type Follow = {
		tilt?: number;
		brightness?: number | {
			day?: number;
			night?: number;
		};
	}

	let {
		flipped = $bindable(false),
		trigger = 'hover',
		follow,
		class: classes,
		children,
		front,
		back
	}: & ClassProp
		& XOR<{ front: Snippet<[() => void]> }, { children: Snippet<[() => void]> }>
		& {
		flipped?: boolean
		trigger?: Trigger
		follow?: Follow
		back?: Snippet<[() => void]>
	} = $props();

	const wrapperClass = untrack(() => twMerge('relative h-full w-full', classes));
	const flipperClass = 'relative w-full h-full transition-transform duration-500';
	const faceClass = 'absolute w-full h-full backface-hidden transition-filter duration-300 ease-in-out';

	let flipperEl: HTMLDivElement | null;
	let rotateY = $state(0);
	let brightness = $state(1);

	const themeManager = getThemeManager();
	const isDark = $derived(themeManager.dark);

	function handleFlip() {
		flipped = !flipped;
	}

	function handleMouseMove(event: MouseEvent) {
		if (!flipperEl || !follow) return;

		const {tilt = 0, brightness: brightnessConfig} = follow;
		const rect = flipperEl.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const {width} = rect;

		const maxTilt = tilt;
		const xZone = x < width / 3 ? 'left' : (x < 2 * width / 3 ? 'center' : 'right');

		if (xZone === 'left') {
			rotateY = -maxTilt;
		} else if (xZone === 'right') {
			rotateY = maxTilt;
		} else {
			rotateY = 0;
		}

		if (brightnessConfig) {
			let baseBrightness: number;
			if (typeof brightnessConfig === 'number') {
				baseBrightness = brightnessConfig;
			} else {
				const {day = 0, night = 0} = brightnessConfig;
				baseBrightness = isDark ? night : day;
			}

			if (xZone === 'left') {
				brightness = 1 - baseBrightness;
			} else if (xZone === 'right') {
				brightness = 1 + baseBrightness;
			} else {
				brightness = 1;
			}
		}
	}

	function handleMouseLeave() {
		if (!follow) return;
		rotateY = 0;
		brightness = 1;
	}

	const flipperStyle = $derived.by(() => {
		const flipRotate = flipped ? 180 : 0;
		const tiltRotate = follow ? rotateY : 0;
		return `transform: rotateY(${flipRotate + tiltRotate}deg); transform-style: preserve-3d;`;
	});

	const brightnessStyle = $derived.by(() => {
		const b = follow ? brightness : 1;
		return `filter: brightness(${b});`;
	});
</script>

<div role="none"
     class={wrapperClass}
     style="perspective: 1000px;"
     onclick={() => trigger === 'click' && handleFlip()}
     onmouseenter={() => trigger === 'hover' && handleFlip()}
     onmouseleave={() => {
		if (trigger === 'hover') handleFlip();
		handleMouseLeave();
	}}
     onmousemove={handleMouseMove}
>
	<div bind:this={flipperEl} class={flipperClass} style={flipperStyle}>
		<div class={faceClass} style={brightnessStyle}>
			{#if front}
				{@render front(handleFlip)}
			{:else if children}
				{@render children(handleFlip)}
			{/if}
		</div>
		<div class={faceClass} style={`${brightnessStyle} transform: rotateY(180deg);`}>
			{#if back}
				{@render back(handleFlip)}
			{/if}
		</div>
	</div>
</div>
