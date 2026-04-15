<script lang="ts">
	import type {Snippet} from 'svelte';
	import {tick} from 'svelte';
	import {Search} from 'lucide-svelte';
	import {Kbd} from '../controls/general/kbd';
	import Spinner from './Spinner.svelte';
	import {Card, type ClassProp, EmptyState, Icon, type IconDefinition} from '..';
	import {twMerge} from 'tailwind-merge';

	export type FlatItem = { value: string | number; data: any };
	export type GroupedItems = { group: string; items: FlatItem[] }[];

	let {
		items: itemsProp = [],
		grouped = false,
		onSelect,
		itemRenderer,
		searchable = true,
		autoFocus = true,
		placeholder = 'Search...',
		query = $bindable(''),
		empty,
		close,
		class: classes,
	}: & ClassProp & {
		items?: FlatItem[] | GroupedItems | Promise<FlatItem[] | GroupedItems>;
		grouped?: boolean;
		onSelect: (item: { value: string | number; data: any }) => void;
		itemRenderer: Snippet<[any, boolean]>;
		searchable?: boolean;
		autoFocus?: boolean;
		placeholder?: string;
		query?: string;
		empty?: { icon?: IconDefinition; title?: string; description?: string; class?: string };
		close?: () => void;
	} = $props();

	let highlighted = $state(-1);
	let loading = $state(false);
	let flatItems = $state<FlatItem[]>([]);
	let groups = $state<GroupedItems>([]);
	let rootEl = $state<HTMLDivElement>();
	let listEl = $state<HTMLDivElement>();
	let inputEl = $state<HTMLInputElement>();
	let keyboardNav = $state(false);
	let resolveId = 0;

	function processResult(result: FlatItem[] | GroupedItems) {
		if (grouped && result.length > 0 && 'group' in result[0]) {
			const g = result as GroupedItems;
			groups = g;
			flatItems = g.flatMap(g => g.items);
		} else {
			groups = [];
			flatItems = result as FlatItem[];
		}
	}

	$effect(() => {
		const p = itemsProp;
		const id = ++resolveId;
		if (p instanceof Promise) {
			loading = true;
			p.then(result => {
				if (id !== resolveId) return;
				processResult(result);
				highlighted = -1;
				loading = false;
			});
		} else {
			processResult(p);
			highlighted = 0;
			loading = false;
		}
	});

	$effect(() => {
		if (!keyboardNav) return;
		const idx = highlighted;
		tick().then(() => {
			if (idx >= 0) listEl?.querySelector(`[data-index="${idx}"]`)?.scrollIntoView({block: 'nearest'});
			keyboardNav = false;
		});
	});

	$effect(() => {
		if (!autoFocus) return;
		setTimeout(() => {
			if (searchable) inputEl?.focus();
			else rootEl?.focus();
		}, 50);
	});

	export function moveDown() {
		if (flatItems.length === 0) return;
		highlighted = highlighted < 0 ? 0 : (highlighted + 1) % flatItems.length;
		keyboardNav = true;
	}

	export function moveUp() {
		if (flatItems.length === 0) return;
		highlighted = highlighted < 0 ? flatItems.length - 1 : (highlighted - 1 + flatItems.length) % flatItems.length;
		keyboardNav = true;
	}

	export function confirm() {
		if (highlighted >= 0 && flatItems[highlighted]) onSelect(flatItems[highlighted]);
	}

	export function unselect() {
		highlighted = -1;
	}

	export function getHighlighted() {
		return highlighted;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') { e.preventDefault(); moveDown(); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); moveUp(); }
		else if (e.key === 'Enter') { e.preventDefault(); confirm(); }
		else if (e.key === 'Escape') { close?.(); }
	}
</script>

<Card class={twMerge('max-h-[40vh] flex flex-col', classes)}>
	<div
		role="dialog"
		bind:this={rootEl}
		tabindex={searchable ? -1 : autoFocus ? 0 : -1}
		onkeydown={autoFocus ? onKeydown : undefined}
		class="flex flex-col flex-1 min-h-0 outline-none"
	>
		{#if searchable}
			<div class="flex items-center gap-3 px-4 border-b border-frame shrink-0">
				{#if loading}
					<Spinner class="w-4 h-4 text-accent shrink-0"/>
				{:else}
					<span class="text-muted-contrast shrink-0">
						<Icon icon={Search} pxSize={16}/>
					</span>
				{/if}
				<input
					bind:this={inputEl}
					bind:value={query}
					type="text"
					{placeholder}
					class="flex-1 min-w-0 bg-transparent outline-none focus:ring-0 border-0 py-3 text-sm text-canvas-contrast placeholder:text-muted-contrast"
				/>
			</div>
		{/if}

		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div role="listbox" class="overflow-y-auto flex-1 min-h-0 py-2" bind:this={listEl}>
			{#if loading && flatItems.length === 0}
				<div class="flex justify-center py-8">
					<Spinner class="w-6 h-6 text-accent"/>
				</div>
			{:else if flatItems.length === 0}
				{#if empty?.icon && empty?.title}
					<EmptyState icon={empty.icon} title={empty.title} description={empty.description} class={empty.class}/>
				{:else}
					<div class="px-4 py-8 text-center text-sm text-muted-contrast">No items available.</div>
				{/if}
			{:else if grouped}
				{#each groups as g, gi}
					{@const offset = groups.slice(0, gi).reduce((sum, pg) => sum + pg.items.length, 0)}
					<div class="px-3 pt-3 pb-1">
						<span class="text-[10px] font-semibold uppercase tracking-wider text-muted-contrast">{g.group}</span>
					</div>
					{#each g.items as item, i}
						{@const idx = offset + i}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							role="option"
							aria-selected={idx === highlighted}
							tabindex="-1"
							data-index={idx}
							class="mx-2 cursor-pointer outline-none"
							onclick={() => onSelect(item)}
							onmouseenter={() => (highlighted = idx)}
						>
							{@render itemRenderer(item.data, idx === highlighted)}
						</div>
					{/each}
				{/each}
			{:else}
				{#each flatItems as item, idx}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						role="option"
						aria-selected={idx === highlighted}
						tabindex="-1"
						data-index={idx}
						class="mx-2 cursor-pointer outline-none"
						onclick={() => onSelect(item)}
						onmouseenter={() => (highlighted = idx)}
					>
						{@render itemRenderer(item.data, idx === highlighted)}
					</div>
				{/each}
			{/if}
		</div>

		<div class="flex items-center gap-1.5 px-4 py-2 border-t border-frame shrink-0">
			<Kbd keys={['↑']}/>
			<Kbd keys={['↓']}/>
			<span class="mx-1 w-px h-3 bg-frame"></span>
			<Kbd keys={['↩']}/>
			<span class="ml-auto"><Kbd keys={['Esc']}/></span>
		</div>
	</div>
</Card>
