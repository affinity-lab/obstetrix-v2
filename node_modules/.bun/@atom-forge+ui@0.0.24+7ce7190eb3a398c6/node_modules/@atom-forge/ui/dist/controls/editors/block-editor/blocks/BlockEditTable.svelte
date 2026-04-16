<script lang="ts">
	import { untrack } from 'svelte';
	import { getBlockAPI } from '../context.js';
	import TableEditor from '../../table-editor/TableEditor.svelte';
	import {makeDefaultTableData, type TableData} from "../../table-editor";

	let { id, data }: { id: string; data: TableData | null } = $props();

	const api     = getBlockAPI();
	const initial = untrack(() => data ?? makeDefaultTableData());

	let blockEl = $state<HTMLElement | undefined>(undefined);

	$effect(() => {
		api.register(id, {
			focus() {
				(blockEl?.querySelector('[data-cell="0,0"]') as HTMLInputElement)?.focus();
			},
		});
		return () => api.unregister(id);
	});
</script>

<div bind:this={blockEl}>
	<TableEditor
		value={data ?? initial}
		onchange={(v) => api.updateData(id, v)}
	/>
</div>
