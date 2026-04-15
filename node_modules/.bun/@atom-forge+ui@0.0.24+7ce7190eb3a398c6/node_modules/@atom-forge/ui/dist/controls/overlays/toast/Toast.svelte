<script lang="ts">
	import {AlertTriangle, Check, CircleX, Info, X} from 'lucide-svelte';
	import {untrack} from "svelte";
	import {fade, slide} from 'svelte/transition';
	import {Button} from '../../general/button';
	import {Icon, type IconDefinition} from "../../general/icon";
	import {getToastManager, type ToastOptions, type ToastType} from './toast-manager.svelte';

	let {
		id,
		message,
		options
	}: {
		id: string;
		message: string;
		options?: ToastOptions;
	} = $props();

	const toastManager = getToastManager();

	const typeIcons: Record<ToastType, IconDefinition> = {
		info: Info,
		success: Check,
		warning: AlertTriangle,
		error: CircleX,
	};

	const effectiveType = untrack(() => options?.type || 'info') as keyof typeof typeIcons;
	const effectiveIcon = untrack(() => options?.icon || typeIcons[effectiveType]);
	const effectiveClosable = untrack(() => options?.closable !== false); // Default to true
</script>

<div
	class="relative flex items-center gap-3 pl-6 pr-4 py-3 rounded-surface shadow-lg use-primary max-w-xs w-full overflow-hidden"
	in:slide={{ duration: 200, axis: 'y' }}
	out:fade={{ duration: 150 }}
>
	<div class="absolute left-0 top-0 bottom-0 w-2" class:bg-blue-500={effectiveType === 'info'} class:bg-green-500={effectiveType === 'success'} class:bg-yellow-500={effectiveType === 'warning'} class:bg-red-500={effectiveType === 'error'}></div>
	{#if effectiveIcon}
		<Icon icon={effectiveIcon} size="5" class="shrink-0"/>
	{/if}
	<div class="grow">
		{message}
		{#if options?.action}
			<Button
				secondary
				compact
				class="mt-2"
				onclick={() => {
					options?.action?.callback();
					toastManager.dismiss(id);
				}}
			>
				{options.action.label}
			</Button>
		{/if}
	</div>
	{#if effectiveClosable}
		<button
			class="shrink-0 ml-2 text-primary-contrast/70 hover:text-primary-contrast"
			onclick={() => toastManager.dismiss(id)}
		>
			<Icon icon={X}/>
		</button>
	{/if}
</div>
