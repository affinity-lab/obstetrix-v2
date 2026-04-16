<script lang="ts">
	import { ProseText } from '../../../content/prose';
	let { data }: { data: { text: string } | null } = $props();
</script>

{#if data?.text?.trim()}
	<ProseText class="mb-0 whitespace-pre-wrap">
		{data.text}
	</ProseText>
{/if}
