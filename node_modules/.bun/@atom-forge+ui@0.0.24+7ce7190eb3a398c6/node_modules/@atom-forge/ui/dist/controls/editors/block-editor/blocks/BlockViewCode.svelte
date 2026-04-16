<script lang="ts">
	import { DocShowCode as ShowCode } from '../../../content/doc';
	import type { CodeBlockData } from './BlockEditCode.svelte';

	let { data }: { data: CodeBlockData | null } = $props();

	const code = $derived(data?.files?.map(f => ({ name: f.filename, language: f.language, code: f.source })) ?? []);
</script>

<ShowCode
	{code}
	title={data?.title}
	open={data?.open}
/>
