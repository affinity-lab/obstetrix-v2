<script lang="ts">
	import type {ClassProp, XOR} from "../../../helpers/types";
	import {twMerge} from "tailwind-merge";
	import SliderView from "../../forms/slider/SliderView.svelte";
	import Button from "../../general/button/Button.svelte";
	import {ChevronLeft, ChevronRight} from "lucide-svelte";
	import {untrack} from "svelte";

	let {
		total,
		pageSize,
		page = $bindable(1),
		compact,
		small,
		class: classes,
	}: ClassProp
		& XOR<{}, { compact: true }, { small: true }>
		& {
		total: number
		pageSize: number
		page?: number
	} = $props();

	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	const sliderSize = $derived(small ? 'small' as const : compact ? 'compact' as const : 'normal' as const);

	// Internal page: updates immediately for live slider position
	let internalPage = $state(page);

	// Sync when page changes from outside
	$effect(() => {
		const p = page;
		untrack(() => { internalPage = p; });
	});

	let debounceTimer: ReturnType<typeof setTimeout>;

	function commit(v: number) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => { page = v; }, 150);
	}

	function onSlider([v]: number[]) {
		internalPage = v;
		commit(v);
	}

	function prev() {
		if (internalPage <= 1) return;
		internalPage -= 1;
		commit(internalPage);
	}

	function next() {
		if (internalPage >= totalPages) return;
		internalPage += 1;
		commit(internalPage);
	}
</script>

<div class={twMerge('flex items-center gap-2', classes)}>
	<Button
		icon={ChevronLeft}
		outline secondary micro
		disabled={internalPage <= 1}
		onclick={prev}
	/>

	<div class="grow min-w-0">
		<SliderView
			values={[internalPage]}
			min={1}
			max={totalPages}
			step={1}
			size={sliderSize}
			showValue
			onUpdate={onSlider}
		/>
	</div>

	<Button
		icon={ChevronRight}
		outline secondary micro
		disabled={internalPage >= totalPages}
		onclick={next}
	/>
</div>
