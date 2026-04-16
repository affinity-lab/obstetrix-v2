<script lang="ts">
	import { ProseMarkdown } from '../../../content/prose';

	let { data }: { data: { text: string } | null } = $props();
</script>

<ProseMarkdown content={data?.text ?? ''} />
