<script lang="ts">
	interface Props {
		size?: number;
		speedMultiplier?: number;
	}

	let {
		size = 40,
		speedMultiplier = 1
	}: Props = $props();

	// Arányok u-ban: központ (8u átmérő -> 4u sugár), gyűrű vastagság 4u, gap 1u
	// r1 (belső) = 4 (központ) + 1 (gap) + 2 (fél-vastagság) = 7u
	// r2 (középső) = 7 + 2 + 1 + 2 = 12u
	// r3 (külső) = 12 + 2 + 1 + 2 = 17u
	// Teljes sugár: 17 + 2 (maradék vastagság) = 19u -> viewBox="-19 -19 38 38"
</script>

<div class="logo-wrapper" style="width: {size}px; height: {size}px;">
	<svg viewBox="-19 -19 38 38">
		<circle r="4" fill="var(--color-accent)" />

		<g class="ring-group" style="animation-duration: {4 / speedMultiplier}s">
			<circle
				r="7"
				stroke="var(--color-primary)"
				stroke-opacity="0.8"
				stroke-width="4"
				fill="none"
				stroke-dasharray="32.98 11"
				transform="rotate(-45)"
			/>
		</g>

		<g class="ring-group reverse" style="animation-duration: {7 / speedMultiplier}s">
			<circle
				r="12"
				stroke="var(--color-primary)"
				stroke-opacity="0.6"
				stroke-width="4"
				fill="none"
				stroke-dasharray="56.55 18.85"
				transform="rotate(180)"
			/>
		</g>

		<g class="ring-group" style="animation-duration: {12 / speedMultiplier}s">
			<circle
				r="17"
				stroke="var(--color-primary)"
				stroke-opacity="0.4"
				stroke-width="4"
				fill="none"
				stroke-dasharray="80.11 26.7"
				transform="rotate(90)"
			/>
		</g>
	</svg>
</div>

<style>
    .logo-wrapper {
        display: inline-block;
    }

    svg {
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .ring-group {
        /* A viewBox eltolása miatt a 0,0 a mértani középpont */
        transform-origin: 0 0;
        animation: rotate linear infinite;
    }

    .reverse {
        animation-direction: reverse;
    }

    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>