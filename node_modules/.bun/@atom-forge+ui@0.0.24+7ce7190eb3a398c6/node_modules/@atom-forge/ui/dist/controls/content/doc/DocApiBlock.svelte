<script lang="ts">
	import { Accordion, AccordionItem } from '../../layout/accordion';
	import { Binary } from "lucide-svelte";
	import type { Snippet } from "svelte";
	import { twMerge } from "tailwind-merge";

	let { title, children, class: className }: { title: string; children: Snippet; class?: string } = $props();
</script>

<Accordion compact class={twMerge(className)}>
	<AccordionItem {title} icon={Binary}>
		<div class="overflow-x-auto p-4">{@render children()}</div>
	</AccordionItem>
</Accordion>
