<script lang="ts">
	import { ProseYoutubeEmbed } from '../../../content/prose';

	let { data }: { data: { url: string; title?: string } | null } = $props();
</script>

<ProseYoutubeEmbed url={data?.url} title={data?.title} />
