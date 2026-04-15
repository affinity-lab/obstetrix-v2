<script lang="ts">
	import { Accordion, AccordionItem } from '../../layout/accordion';
	import { Card } from '../../display/card';
	import { Code } from "lucide-svelte";
	import type { Component } from "svelte";
	import { twMerge } from "tailwind-merge";
	import DocShowCode from "./DocShowCode.svelte";
	import type { CodeFile } from "./DocShowCode.svelte";

	let { component: Control, code, class: classes }: {
		component?: Component;
		code: string | CodeFile[];
		class?: string;
	} = $props();
</script>

<div class="flex flex-col gap-4">
	{#if Control}
		<Card class={twMerge('p-6 flex justify-center items-center min-h-24', classes)}>
			<Control />
		</Card>
	{/if}
	<Accordion compact>
		<AccordionItem title="Show Code" icon={Code}>
			<DocShowCode {code} class="border-0 rounded-none" />
		</AccordionItem>
	</Accordion>
</div>
