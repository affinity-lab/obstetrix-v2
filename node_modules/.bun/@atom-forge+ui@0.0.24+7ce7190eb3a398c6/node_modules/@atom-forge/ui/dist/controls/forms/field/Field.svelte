<script lang="ts">
	import {twMerge} from 'tailwind-merge';
	import type {ClassProp, ChildrenProp} from '../../../helpers/types';
	import type {Snippet} from 'svelte';

	let {
		label,
		hint,
		error,
		required = false,
		optional = false,
		layout = 'vertical',
		for: forId,
		children,
		labelSnippet,
		hintSnippet,
		errorSnippet,
		action,
		class: classes,
	}: ClassProp & ChildrenProp & {
		label?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		optional?: boolean;
		layout?: 'vertical' | 'horizontal';
		for?: string;
		labelSnippet?: Snippet;
		hintSnippet?: Snippet;
		errorSnippet?: Snippet;
		action?: Snippet;
	} = $props();

	const isHorizontal = $derived(layout === 'horizontal');
</script>

<!--
	In a FieldGroup (horizontal layout) this component exposes two grid children:
	  col 1 → label row
	  col 2 → control + meta row
	In vertical layout it's a simple flex column.
-->
{#if isHorizontal}
	<!-- label cell -->
	<div class={twMerge('flex items-center gap-1 pt-2 min-w-0', classes)}>
		{#if labelSnippet}
			{@render labelSnippet()}
		{:else if label}
			<label for={forId} class="text-sm text-muted-contrast leading-snug">
				{label}
				{#if required}<span class="text-error ml-0.5">*</span>{/if}
				{#if optional}<span class="text-muted-contrast text-xs ml-1">(optional)</span>{/if}
			</label>
		{/if}
		{#if action}
			<span class="ml-auto">{@render action()}</span>
		{/if}
	</div>
	<!-- control cell -->
	<div class="flex flex-col gap-1 min-w-0">
		{@render children()}
		{#if error || errorSnippet}
			<p class="text-xs text-error">
				{#if errorSnippet}{@render errorSnippet()}{:else}{error}{/if}
			</p>
		{:else if hint || hintSnippet}
			<p class="text-xs text-muted-contrast">
				{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
			</p>
		{/if}
	</div>
{:else}
	<!-- vertical layout — single column -->
	<div class={twMerge('flex flex-col gap-1 min-w-0', classes)}>
		{#if label || labelSnippet || action}
			<div class="flex items-center gap-1">
				{#if labelSnippet}
					{@render labelSnippet()}
				{:else if label}
					<label for={forId} class="text-sm font-medium text-canvas-contrast leading-snug">
						{label}
						{#if required}<span class="text-error ml-0.5">*</span>{/if}
						{#if optional}<span class="text-muted-contrast text-xs ml-1">(optional)</span>{/if}
					</label>
				{/if}
				{#if action}
					<span class="ml-auto">{@render action()}</span>
				{/if}
			</div>
		{/if}

		{@render children()}

		{#if error || errorSnippet}
			<p class="text-xs text-error">
				{#if errorSnippet}{@render errorSnippet()}{:else}{error}{/if}
			</p>
		{:else if hint || hintSnippet}
			<p class="text-xs text-muted-contrast">
				{#if hintSnippet}{@render hintSnippet()}{:else}{hint}{/if}
			</p>
		{/if}
	</div>
{/if}
