<script lang="ts">
	import {Button, Card, defineIcon, getPopupManager, PopupContainer} from "../../../index"
	import {twMerge} from "tailwind-merge";
	import {ChevronRight} from 'lucide-svelte';
	import ContextMenu from './ContextMenu.svelte';
	import {type ContextMenuItemConfig, type ContextMenuItemConfigAny} from "./types";

	let {config: _config}: { config: ContextMenuItemConfig[] } = $props();
	let config = $derived(_config) as ContextMenuItemConfigAny[];
	const hasAnyChevron = $derived(config.some(item => item.chevron ?? !!item.submenu));
</script>

<PopupContainer>
	{@const manager = getPopupManager()}
	<Card class="shadow-2xl p-1 flex flex-col gap-0">
		{#each config as item}
			{#if item.separator}
				<hr class="my-1 bg-frame h-px border-0"/>
			{:else}
				{@const showChevron = item.chevron ?? ("submenu" in item && !!item.submenu)}
				<Button
					ghost compact
					class={twMerge('w-full justify-between', item.warning && 'text-error')}
					icon={item.icon}
					label={item.label}
					disabled={item.disabled}
					endIcon={hasAnyChevron 
						? showChevron 
							? defineIcon(ChevronRight)
							: defineIcon(ChevronRight).class("invisible")
						: undefined
					}
					onclick={event => {
						if (item.submenu) {
							manager.open.component(ContextMenu, { config: item.submenu }, { anchor: event, align: 'side', offset: -8 }, item.submenu);
						} else if (item.onclick) {
							item.onclick(event, manager);
						} else if (item.resolveWith !== undefined) {
							manager.resolveRoot(item.resolveWith);
						}
					}}
				/>
			{/if}
		{/each}
	</Card>
</PopupContainer>
