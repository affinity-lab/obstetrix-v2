<script lang="ts">
	import { ProseLinkCard } from '../../../content/prose';
	import type { LinkCardData } from './BlockEditLinkCard.svelte';

	let { data }: { data: LinkCardData | null } = $props();
</script>

<ProseLinkCard
	url={data?.url ?? ''}
	title={data?.title}
	description={data?.description}
	favicon={data?.favicon}
/>
