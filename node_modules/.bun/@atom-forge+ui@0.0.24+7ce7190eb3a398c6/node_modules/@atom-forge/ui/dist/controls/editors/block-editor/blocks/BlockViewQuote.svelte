<script lang="ts">
	import { ProseBlockQuote } from '../../../content/prose';

	let { data }: { data: { text: string } | null } = $props();
</script>

<ProseBlockQuote quote={data?.text ?? ''} />
