<script lang="ts">
	import { ProseTitle } from '../../../content/prose';
	let { data }: { data: { text: string; level: 1 | 2 | 3 } | null } = $props();
</script>

{#if data?.text}
	<ProseTitle level={data.level ?? 1} class="mb-0 mt-0">
		{data.text}
	</ProseTitle>
{/if}
