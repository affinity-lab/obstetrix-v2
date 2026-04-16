<script lang="ts">
	import type {ChildrenProp} from "../../../index";
	import {setContext, untrack} from 'svelte';

	export type TabsVariant = 'line' | 'button';

	let {
		initialTabId,
		children,
		onTabChange,
		variant: _variant = 'line' as TabsVariant
	}: & ChildrenProp
		& {
		initialTabId: string;
		onTabChange?: (id: string) => void;
		variant?: TabsVariant;
	} = $props();

	const variant = untrack(() => _variant);
	let activeTabId = $state(untrack(() => initialTabId));

	setContext('tabs-context', {
		isActive: (id: string) => activeTabId === id,
		selectTab: (id: string) => {
			activeTabId = id;
			if (onTabChange) {
				onTabChange(id);
			}
		},
		variant
	});
</script>

<div>
	{@render children()}
</div>
