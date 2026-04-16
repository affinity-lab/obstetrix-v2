<script lang="ts">
	import type {Snippet} from 'svelte';
	import {untrack} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import {X} from 'lucide-svelte';
	import {Icon} from '../../general/icon';
	import {getPopupManager} from '../../overlays/popup';
	import SortableList from '../../data/sortable/SortableList.svelte';
	import TagEditorDropdown from './TagEditorDropdown.svelte';
	import type {FlatItem} from '../../../helpers/SelectPopup.svelte';
	import type {XOR, ClassProp} from '../../../index';

	type OptionsSource = string[] | ((query: string) => Promise<string[]>);
	type SortableTag = { id: string; tag: string };

	let {
		value = $bindable<string[]>([]),
		options,
		placeholder = 'Add tags...',
		disabled  = false,
		clearable = false,
		allowNew  = true,
		sortable  = false,
		lowercase,
		uppercase,
		compact,
		small,
		class: classes,
		chip: chipSnippet,
		option: optionSnippet,
	}: XOR<{ lowercase: true }, { uppercase: true }, {}>
		& XOR<{ compact: true }, { small: true }, {}>
		& ClassProp
		& {
		value?:       string[];
		options?: OptionsSource;
		placeholder?: string;
		disabled?:    boolean;
		clearable?:   boolean;
		allowNew?:    boolean;
		sortable?:    boolean;
		chip?:        Snippet<[string, () => void]>;
		option?:      Snippet<[string, boolean]>;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');
	const popupManager = getPopupManager();

	let containerEl = $state<HTMLDivElement>();
	let inputEl     = $state<HTMLInputElement>();
	let isOpen      = $state(false);
	let focused     = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Shared reactive state passed by reference into the popup
	const sharedState = $state<{ items: FlatItem[]; query: string }>({ items: [], query: '' });

	let sortableItems = $state<SortableTag[]>(
		untrack(() => sortable ? value.map(tag => ({id: tag, tag})) : [])
	);

	$effect(() => {
		if (!sortable) return;
		const tags = sortableItems.map(i => i.tag);
		untrack(() => { value = tags; });
	});

	function normalize(s: string) {
		if (lowercase) return s.toLowerCase();
		if (uppercase) return s.toUpperCase();
		return s;
	}

	// Rebuild suggestion items whenever query or value changes
	$effect(() => {
		const raw = sharedState.query;
		const q = normalize(raw.trim());
		const cur = value;

		function build(suggs: string[]): FlatItem[] {
			const filtered = suggs
				.filter(s => !q || normalize(s).includes(q))
				.filter(s => !cur.includes(normalize(s)))
				.map(s => ({value: normalize(s), data: {label: s, isNew: false}}));

			const exactMatch = suggs.some(s => normalize(s) === q);
			if (allowNew && q && !exactMatch && !cur.includes(q)) {
				return [{value: q, data: {label: q, isNew: true}}, ...filtered];
			}
			return filtered;
		}

		if (typeof options !== 'function') {
			sharedState.items = build(options ?? []);
			return;
		}

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const p = (options as (q: string) => Promise<string[]>)(raw);
			p.then(result => { sharedState.items = build(result); });
		}, 200);
	});

	function handleAdd(tag: string) {
		tag = normalize(tag.trim());
		if (!tag || value.includes(tag)) return;
		value = [...value, tag];
		if (sortable) sortableItems = [...sortableItems, {id: tag, tag}];
	}

	function removeTag(tag: string) {
		value = value.filter(t => t !== tag);
		if (sortable) sortableItems = sortableItems.filter(i => i.id !== tag);
	}

	async function openDropdown() {
		if (disabled || isOpen || !options) return;
		isOpen = true;
		await popupManager.open.component(
			TagEditorDropdown,
			{sharedState, allowNew, onAdd: handleAdd, option: optionSnippet},
			{anchor: containerEl!, align: 'both'},
		);
		isOpen = false;
		sharedState.query = '';
	}

	function onInput(e: Event) {
		const raw = (e.target as HTMLInputElement).value;
		const norm = normalize(raw);
		sharedState.query = norm;
		if (norm !== raw) (e.target as HTMLInputElement).value = norm;
		if (!isOpen) openDropdown();
	}

	function onKeydown(e: KeyboardEvent) {
		// Backspace on empty input → remove last tag
		if (e.key === 'Backspace' && sharedState.query === '') {
			e.preventDefault();
			const last = value.at(-1);
			if (last) removeTag(last);
		}
		// Enter without popup (no suggestions) → add free-form tag
		if (e.key === 'Enter' && !isOpen && allowNew && sharedState.query.trim()) {
			e.preventDefault();
			handleAdd(sharedState.query);
			sharedState.query = '';
		}
	}

	const containerCls = $derived(twMerge(
		'flex flex-wrap items-center gap-1 w-full px-3 rounded-surface border bg-control transition-colors cursor-text',
		size === 'normal'  && 'min-h-10 py-1.5 text-sm',
		size === 'compact' && 'min-h-8 py-1 text-xs',
		size === 'small'   && 'min-h-6 py-0.5 text-xs px-2',
		isOpen  ? 'border-accent ring-2 ring-accent/20' : 'border-frame hover:border-accent',
		disabled && 'opacity-50 cursor-not-allowed',
		classes,
	));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div role="presentation" bind:this={containerEl} class={containerCls} onclick={() => inputEl?.focus()}>
	{#if sortable}
		<SortableList
			bind:items={sortableItems}
			orientation="horizontal"
			id="tag-editor-chips"
			class="contents"
		>
			{#snippet item(si)}
				{#if chipSnippet}
					{@render chipSnippet(si.tag, () => removeTag(si.tag))}
				{:else}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-contrast text-xs font-medium cursor-grab active:cursor-grabbing select-none shrink-0">
						{si.tag}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
						<span
							role="button"
							tabindex="0"
							onkeydown={e => { e.stopPropagation(); e.key === 'Enter' && removeTag(si.tag); }}
							onclick={e => { e.stopPropagation(); removeTag(si.tag); }}
							class="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
						>
							<Icon icon={X} pxSize={10}/>
						</span>
					</span>
				{/if}
			{/snippet}
		</SortableList>
	{:else}
		{#each value as tag}
			{#if chipSnippet}
				{@render chipSnippet(tag, () => removeTag(tag))}
			{:else}
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-contrast text-xs font-medium shrink-0">
					{tag}
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
					<span
						role="button"
						tabindex="0"
						onkeydown={e => { e.stopPropagation(); e.key === 'Enter' && removeTag(tag); }}
						onclick={e => { e.stopPropagation(); removeTag(tag); }}
						class="opacity-60 hover:opacity-100 transition-opacity"
					>
						<Icon icon={X} pxSize={10}/>
					</span>
				</span>
			{/if}
		{/each}
	{/if}

	<input
		bind:this={inputEl}
		value={sharedState.query}
		oninput={onInput}
		onkeydown={onKeydown}
		onfocus={() => { focused = true; if (options && !isOpen) openDropdown(); }}
		onblur={() => { focused = false; }}
		{disabled}
		placeholder={value.length === 0 ? placeholder : ''}
		class="flex-1 min-w-20 bg-transparent outline-none py-0 px-2 focus:ring-0 border-0 placeholder:text-muted-contrast text-canvas-contrast"
	/>

	{#if clearable && value.length > 0}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<span
			role="button"
			tabindex="0"
			onclick={() => { value = []; sortableItems = []; inputEl?.focus(); }}
			class="text-muted-contrast hover:text-canvas-contrast shrink-0 ml-1"
		>
			<Icon icon={X} pxSize={12}/>
		</span>
	{/if}
</div>
