<script lang="ts">
	import { untrack } from 'svelte';
	import { getBlockAPI } from '../context.js';
	import MarkdownEditor from '../../markdown-editor/MarkdownEditor.svelte';
	import { twMerge } from 'tailwind-merge';
	import {
		Info, TriangleAlert, CircleCheck, CircleX, CircleAlert, Lightbulb,
		Zap, Star, BookOpen, MessageCircle, Shield, Flag, Bell,
		Heart, Eye, Lock, Flame, Rocket, Pin, Megaphone, Bookmark,
	} from 'lucide-svelte';


	type CalloutColor = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note';

	const COLORS: Record<CalloutColor, { bg: string; border: string; iconColor: string; swatch: string; label: string }> = {
		info:    { bg: 'bg-blue-50   dark:bg-blue-950/30',   border: 'border-l-blue-400   dark:border-l-blue-500',   iconColor: 'text-blue-500   dark:text-blue-400',   swatch: 'bg-blue-400',   label: 'Info'    },
		warning: { bg: 'bg-amber-50  dark:bg-amber-950/30',  border: 'border-l-amber-400  dark:border-l-amber-500',  iconColor: 'text-amber-500  dark:text-amber-400',  swatch: 'bg-amber-400',  label: 'Warning' },
		success: { bg: 'bg-green-50  dark:bg-green-950/30',  border: 'border-l-green-500  dark:border-l-green-500',  iconColor: 'text-green-500  dark:text-green-400',  swatch: 'bg-green-500',  label: 'Success' },
		error:   { bg: 'bg-red-50    dark:bg-red-950/30',    border: 'border-l-red-400    dark:border-l-red-500',    iconColor: 'text-red-500    dark:text-red-400',    swatch: 'bg-red-400',    label: 'Error'   },
		tip:     { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-l-purple-400 dark:border-l-purple-500', iconColor: 'text-purple-500 dark:text-purple-400', swatch: 'bg-purple-400', label: 'Tip'     },
		note:    { bg: 'bg-stone-100 dark:bg-stone-800/50',  border: 'border-l-stone-300  dark:border-l-stone-600',  iconColor: 'text-stone-400  dark:text-stone-500',  swatch: 'bg-stone-400',  label: 'Note'    },
	};

	const COLOR_KEYS = Object.keys(COLORS) as CalloutColor[];

	const ICONS: Record<string, typeof Info> = {
		Info, TriangleAlert, CircleCheck, CircleX, CircleAlert, Lightbulb,
		Zap, Star, BookOpen, MessageCircle, Shield, Flag, Bell,
		Heart, Eye, Lock, Flame, Rocket, Pin, Megaphone, Bookmark,
	};
	const ICON_KEYS = Object.keys(ICONS);

	type CalloutData = { icon: string; color: CalloutColor; title: string; text: string };

	let { id, data }: { id: string; data: CalloutData | null } = $props();

	const api = getBlockAPI();
	let editorRef = $state<ReturnType<typeof MarkdownEditor> | undefined>(undefined);
	let titleEl   = $state<HTMLInputElement | undefined>(undefined);

	let icon  = $state(untrack(() => data?.icon  ?? 'Info'));
	let color = $state<CalloutColor>(untrack(() => data?.color ?? 'info'));
	let title = $state(untrack(() => data?.title ?? ''));
	let text  = $state(untrack(() => data?.text  ?? ''));

	let showIconPicker = $state(false);

	$effect(() => {
		api.register(id, { focus() { titleEl?.focus(); } });
		return () => api.unregister(id);
	});

	$effect(() => {
		const d = data;
		untrack(() => {
			if (d?.icon  !== icon)  icon  = d?.icon  ?? 'Info';
			if (d?.color !== color) color = d?.color ?? 'info';
			if (d?.title !== title) title = d?.title ?? '';
			if (d?.text  !== text)  text  = d?.text  ?? '';
		});
	});

	function save() {
		api.updateData(id, { icon, color, title, text });
	}

	const cs        = $derived(COLORS[color] ?? COLORS.info);
	const IconComp  = $derived(ICONS[icon] ?? Info);
</script>

<!-- Close icon picker on outside click -->
{#if showIconPicker}
	<button class="fixed inset-0 z-10 cursor-default" onclick={() => showIconPicker = false} tabindex="-1" aria-hidden="true"></button>
{/if}

<div class={twMerge('rounded-r-lg border-l-4 px-4 py-3 space-y-2', cs.bg, cs.border)}>
	<!-- Header: icon + title + color swatches -->
	<div class="flex items-center gap-2">
		<!-- Icon button -->
		<div class="relative z-20 shrink-0">
			{#each [IconComp] as C}
				<button
					class={twMerge('flex items-center justify-center w-6 h-6 rounded cursor-pointer hover:opacity-70 transition-opacity shrink-0', cs.iconColor)}
					onclick={() => showIconPicker = !showIconPicker}
					title="Change icon"
				>
					<C size={16} />
				</button>
			{/each}
			{#if showIconPicker}
				<div class="absolute left-0 top-7 bg-surface border border-frame rounded-lg shadow-lg p-2 grid grid-cols-5 gap-0.5 w-[152px]">
					{#each ICON_KEYS as key}
						{@const IC = ICONS[key]}
						<button
							class={twMerge(
								'flex items-center justify-center w-6 h-6 rounded cursor-pointer transition-colors',
								icon === key ? 'bg-accent/15 text-accent' : 'text-muted-contrast hover:text-canvas-contrast hover:bg-secondary',
							)}
							onclick={() => { icon = key; showIconPicker = false; save(); }}
							title={key}
						>
							<IC size={13} />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Title input -->
		<input
			bind:this={titleEl}
			bind:value={title}
			oninput={save}
			class="flex-1 bg-transparent outline-none border-none text-sm font-semibold text-canvas-contrast placeholder:text-muted-contrast/50 min-w-0"
			placeholder="Title..."
		/>

		<!-- Color swatches -->
		<div class="flex items-center gap-1 shrink-0">
			{#each COLOR_KEYS as key}
				{@const c = COLORS[key]}
				<button
					class={twMerge(
						'w-3.5 h-3.5 rounded-full cursor-pointer transition-transform hover:scale-125',
						c.swatch,
						color === key ? 'ring-2 ring-offset-1 ring-current scale-110' : '',
					)}
					onclick={() => { color = key; save(); }}
					title={c.label}
				></button>
			{/each}
		</div>
	</div>

	<!-- Markdown content -->
	<div class="pl-8">
		<MarkdownEditor
			bind:this={editorRef}
			value={text}
			onchange={(v) => { text = v; save(); }}
			onnavigate={(dir) => dir === 'next' ? api.focusNext(id) : api.focusPrev(id)}
		/>
	</div>
</div>
