<script lang="ts">
	type TooltipData = {
		label: string;
		series: {
			name: string;
			value: number;
			color: string;
		}[];
	};

	let {data}: { data: TooltipData } = $props();
</script>

<div class="p-2 bg-stone-900/80 dark:bg-stone-950/80 backdrop-blur-md rounded-surface shadow-lg border border-stone-700 text-[10px] leading-tight">
	<div class="font-bold text-stone-100 mb-1">{data.label}</div>
	<div class="space-y-0.5">
		{#each data.series as item}
			<div class="flex items-center gap-1.5">
				<div class="w-2 h-2 rounded-sm shrink-0" style:background-color={item.color}></div>
				<span class="text-stone-300 truncate">{item.name}:</span>
				<span class="font-medium text-stone-100">{item.value}</span>
			</div>
		{/each}
	</div>
</div>
