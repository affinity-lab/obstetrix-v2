<script lang="ts">
	import type {Snippet} from 'svelte';
	import {untrack, onMount} from 'svelte';
	import {twMerge} from 'tailwind-merge';
	import {ChevronDown, X} from 'lucide-svelte';
	import {Icon} from '../../general/icon';
	import {getPopupManager} from '../../overlays/popup';
	import SortableList from '../../data/sortable/SortableList.svelte';
	import MultiSelectDropdown from './MultiSelectDropdown.svelte';
	import type {SelectOption, SelectOptionsSource} from '../select/Select.svelte';
	import type {XOR, ClassProp} from '../../../index';

	type SortableOption = SelectOption & { id: string | number };

	let {
		value = $bindable<(string | number)[]>([]),
		options,
		placeholder = 'Select...',
		disabled = false,
		searchable = true,
		clearable = false,
		sortable = false,
		max,
		compact,
		small,
		class: classes,
		option: optionSnippet,
		chip: chipSnippet,
	}: XOR<{ compact: true }, { small: true }, {}>
		& ClassProp
		& {
		value?: (string | number)[];
		options: SelectOptionsSource;
		placeholder?: string;
		disabled?: boolean;
		searchable?: boolean;
		clearable?: boolean;
		sortable?: boolean;
		max?: number;
		option?: Snippet<[SelectOption, boolean]>;
		chip?: Snippet<[SelectOption, () => void]>;
	} = $props();

	const size = untrack(() => small ? 'small' : compact ? 'compact' : 'normal');
	const popupManager = getPopupManager();

	let triggerEl = $state<HTMLButtonElement>();
	let isOpen = $state(false);
	let cachedOptions = $state<SelectOption[]>([]); // Stores options that have been seen/resolved
	const isSortable = untrack(() => sortable);

	// Removed optionsFunction as it's no longer needed with the new SelectOptionsSource structure

	let mounted = $state(false);
	onMount(() => { mounted = true; });

	let sortableItems = $state<SortableOption[]>([]); // Initialize as empty

	// Effect to initialize sortableItems based on value and options
	$effect(() => {
		if (!mounted || !isSortable) {
			sortableItems = []; // Clear if not sortable or not mounted
			return;
		}

		if (value.length === 0) {
			sortableItems = [];
			return;
		}

		if (Array.isArray(options)) {
			// If options is an array, filter directly
			sortableItems = value
				.map(v => (options as SelectOption[]).find(o => o.value === v))
				.filter((o): o is SelectOption => o !== undefined)
				.map(o => ({...o!, id: o!.value}));
		} else if (typeof options === 'object' && options !== null && 'get' in options) {
			// If options has a 'get' method, use it to resolve the values
			options.get(value).then(resolvedOpts => {
				// Ensure the order matches the 'value' array
				const orderedResolvedOpts = value
					.map(v => resolvedOpts.find(o => o.value === v))
					.filter((o): o is SelectOption => o !== undefined);

				sortableItems = orderedResolvedOpts.map(o => ({...o!, id: o!.value}));

				// Also add these resolved options to cachedOptions
				cachedOptions = [
					...cachedOptions,
					...orderedResolvedOpts.filter(ro => !cachedOptions.some(co => co.value === ro.value))
				];
			}).catch(error => {
				console.error("Failed to resolve initial sortable options for MultiSelect:", error);
				sortableItems = [];
			});
		} else {
			// Fallback for unexpected options type or if 'get' is missing
			sortableItems = [];
		}
	});

	// This effect synchronizes sortableItems back to the value prop
	$effect(() => {
		if (!isSortable || !mounted) return;
		const newOrder = sortableItems.map(i => i.value);
		untrack(() => {
			// Only update if the order has actually changed to prevent infinite loops
			if (newOrder.join(',') !== value.join(',')) {
				value = newOrder;
			}
		});
	});

	const selectedOptions = $derived.by(() => {
		if (isSortable) return sortableItems;
		if (value.length === 0) return [];

		if (Array.isArray(options)) {
			return (options as SelectOption[]).filter(o => value.includes(o.value));
		} else if (typeof options === 'object' && options !== null && 'get' in options) {
			// For async options, rely on cachedOptions for display
			return cachedOptions.filter(o => value.includes(o.value));
		}
		// Fallback for unexpected options type
		return [];
	});

	function removeValue(v: string | number) {
		if (isSortable) {
			sortableItems = sortableItems.filter(i => i.id !== v);
		} else {
			value = value.filter(x => x !== v);
		}
		// Also remove from cachedOptions if it's no longer selected
		cachedOptions = cachedOptions.filter(o => o.value !== v || value.includes(o.value));
	}

	function handleToggle(opt: SelectOption, newValues: (string | number)[]) {
		if (isSortable) {
			const isAdding = newValues.includes(opt.value);
			sortableItems = isAdding
				? [...sortableItems, {...opt, id: opt.value}]
				: sortableItems.filter(i => i.id !== opt.value);
		} else {
			value = newValues;
		}
		// Ensure the toggled option is in cachedOptions
		if (!cachedOptions.some(o => o.value === opt.value)) {
			cachedOptions = [...cachedOptions, opt];
		}
		// Remove from cachedOptions if it's no longer in newValues
		cachedOptions = cachedOptions.filter(o => newValues.includes(o.value) || o.value !== opt.value);
	}

	async function openDropdown() {
		if (disabled || isOpen) return;
		isOpen = true;
		await popupManager.open.component(
			MultiSelectDropdown,
			{options, initialValue: value, max, searchable, onToggle: handleToggle, optionSnippet},
			{anchor: triggerEl!, align: 'both'},
		);
		isOpen = false;
	}

	function onTriggerKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openDropdown();
		}
	}

	const triggerCls = $derived(twMerge(
		'w-full flex items-center gap-2 px-3 rounded-surface border bg-control text-left transition-colors',
		size === 'normal'  && 'min-h-10 py-1.5 text-sm',
		size === 'compact' && 'min-h-8 py-1 text-xs',
		size === 'small'   && 'min-h-6 py-0.5 text-xs px-2',
		isOpen ? 'border-accent ring-2 ring-accent/20' : 'border-frame',
		disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent',
		classes,
	));
</script>

<button
	bind:this={triggerEl}
	onclick={openDropdown}
	onkeydown={onTriggerKeydown}
	class={triggerCls}
	{disabled}
>
	<span class="flex-1 flex flex-wrap gap-1 min-w-0" role="presentation">
		{#if selectedOptions.length === 0}
			<span class="text-muted-contrast">{placeholder}</span>
		{:else if isSortable}
			<SortableList
				bind:items={sortableItems}
				orientation="horizontal"
				id="multiselect-chips"
				class="flex flex-wrap gap-1"
			>
				{#snippet item(chipItem)}
					{#if chipSnippet}
						{@render chipSnippet(chipItem, () => removeValue(chipItem.id))}
					{:else}
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-contrast text-xs font-medium cursor-grab active:cursor-grabbing select-none">
							{chipItem.label}
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
							<span
								role="button"
								tabindex="0"
								onkeydown={e => { e.stopPropagation(); e.key === 'Enter' && removeValue(chipItem.id); }}
								onclick={e => { e.stopPropagation(); removeValue(chipItem.id); }}
								class="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
							>
								<Icon icon={X} pxSize={10}/>
							</span>
						</span>
					{/if}
				{/snippet}
			</SortableList>
		{:else}
			{#each selectedOptions as opt}
				{#if chipSnippet}
					{@render chipSnippet(opt, () => removeValue(opt.value))}
				{:else}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent text-accent-contrast text-xs font-medium">
						{opt.label}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
						<span
							role="button"
							tabindex="0"
							onkeydown={e => { e.stopPropagation(); e.key === 'Enter' && removeValue(opt.value); }}
							onclick={e => { e.stopPropagation(); removeValue(opt.value); }}
							class="opacity-60 hover:opacity-100 transition-opacity"
						>
							<Icon icon={X} pxSize={10}/>
						</span>
					</span>
				{/if}
			{/each}
		{/if}
	</span>
	{#if clearable && value.length > 0}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
		<span
			role="button"
			tabindex="0"
			onclick={e => { e.stopPropagation(); value = []; if (isSortable) sortableItems = []; }}
			class="text-muted-contrast hover:text-canvas-contrast shrink-0"
		>
			<Icon icon={X} pxSize={12}/>
		</span>
	{/if}
	<Icon
		icon={ChevronDown}
		pxSize={14}
		class={twMerge('text-muted-contrast shrink-0 transition-transform duration-150', isOpen && 'rotate-180')}
	/>
</button>
