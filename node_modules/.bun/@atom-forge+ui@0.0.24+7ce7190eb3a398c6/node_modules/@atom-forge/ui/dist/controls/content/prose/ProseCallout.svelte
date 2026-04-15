<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import type { Component } from 'svelte';
	import {
		Info, TriangleAlert, CircleCheck, CircleX, CircleAlert, Lightbulb,
		Zap, Star, BookOpen, MessageCircle, Shield, Flag, Bell,
		Heart, Eye, Lock, Flame, Rocket, Pin, Megaphone, Bookmark,
	} from 'lucide-svelte';
	import ProseMarkdown from './ProseMarkdown.svelte';

	type CalloutVariant = 'note' | 'warning' | 'tip' | 'success' | 'info' | 'error';

	const COLORS: Record<CalloutVariant, { bg: string; border: string; iconColor: string }> = {
		info:    { bg: 'bg-blue-50   dark:bg-blue-950/30',   border: 'border-l-blue-400   dark:border-l-blue-500',   iconColor: 'text-blue-500   dark:text-blue-400'   },
		warning: { bg: 'bg-amber-50  dark:bg-amber-950/30',  border: 'border-l-amber-400  dark:border-l-amber-500',  iconColor: 'text-amber-500  dark:text-amber-400'  },
		success: { bg: 'bg-green-50  dark:bg-green-950/30',  border: 'border-l-green-500  dark:border-l-green-500',  iconColor: 'text-green-500  dark:text-green-400'  },
		error:   { bg: 'bg-red-50    dark:bg-red-950/30',    border: 'border-l-red-400    dark:border-l-red-500',    iconColor: 'text-red-500    dark:text-red-400'    },
		tip:     { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-l-purple-400 dark:border-l-purple-500', iconColor: 'text-purple-500 dark:text-purple-400' },
		note:    { bg: 'bg-stone-100 dark:bg-stone-800/50',  border: 'border-l-stone-300  dark:border-l-stone-600',  iconColor: 'text-stone-400  dark:text-stone-500'  },
	};

	const ICONS: Record<string, any> = {
		Info, TriangleAlert, CircleCheck, CircleX, CircleAlert, Lightbulb,
		Zap, Star, BookOpen, MessageCircle, Shield, Flag, Bell,
		Heart, Eye, Lock, Flame, Rocket, Pin, Megaphone, Bookmark,
	};

	let {
		variant = 'note',
		icon,
		title,
		content,
	}: {
		variant?: CalloutVariant;
		icon?: string;
		title?: string;
		content?: string;
	} = $props();

	const cs = $derived(COLORS[variant] ?? COLORS.note);
	const IconComp = $derived(icon ? (ICONS[icon] ?? Info) : {
		note: Info, warning: TriangleAlert, tip: Lightbulb,
		success: CircleCheck, info: Info, error: CircleX,
	}[variant] ?? Info);
</script>

<div class={twMerge('rounded-r-lg border-l-4 px-4 py-3 space-y-2', cs.bg, cs.border)}>
	<div class="flex items-center gap-2">
		{#each [IconComp] as C}
			<C size={16} class={cs.iconColor} />
		{/each}
		{#if title}
			<span class="text-sm font-semibold text-canvas-contrast">{title}</span>
		{/if}
	</div>
	{#if content}
		<div class="pl-6">
			<ProseMarkdown {content} />
		</div>
	{/if}
</div>
