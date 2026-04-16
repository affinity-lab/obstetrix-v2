<script lang="ts" generics="T extends Record<string, any>">
	import {Card} from "../../display/card";
	import {CheckboxView} from '../../forms/checkbox';
	import type {ColumnDef} from './types';

	let {
		columns = $bindable(),
		onToggleColumn
	}: {
		columns: ColumnDef<T>[];
		onToggleColumn: (key: keyof T) => void;
	} = $props();

</script>

<Card class="rounded-md shadow-lg p-1 flex flex-col w-48">
	<div class="flex flex-col">
		{#each columns as col}
			{#if !col.fixed}
				<CheckboxView
					status={col.visible ? 'checked' : 'unchecked'}
					disabled={col.fixed}
					label={col.label}
					onclick={() => col.visible = !col.visible}
					compact
				/>
			{/if}
		{/each}
	</div>
</Card>
