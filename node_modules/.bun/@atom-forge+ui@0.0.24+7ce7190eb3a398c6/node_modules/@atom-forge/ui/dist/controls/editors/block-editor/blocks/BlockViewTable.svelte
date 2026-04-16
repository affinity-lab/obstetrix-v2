<script lang="ts">
	import TablePreview from '../../table-editor/TablePreview.svelte';
	import type { TableData } from '../../table-editor';
	let { data }: { data: TableData | null } = $props();
</script>

<TablePreview {data} />
