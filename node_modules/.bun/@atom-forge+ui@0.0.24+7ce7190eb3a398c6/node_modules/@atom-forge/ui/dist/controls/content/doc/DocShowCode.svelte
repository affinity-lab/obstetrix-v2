<script module lang="ts">
	export type CodeFile = { name: string; language?: string; code: string };
</script>

<script lang="ts">
	import Highlight from 'svelte-highlight';
	import typescript from 'svelte-highlight/languages/typescript';
	import javascript from 'svelte-highlight/languages/javascript';
	import python from 'svelte-highlight/languages/python';
	import css from 'svelte-highlight/languages/css';
	import xml from 'svelte-highlight/languages/xml';
	import bash from 'svelte-highlight/languages/bash';
	import shell from 'svelte-highlight/languages/shell';
	import json from 'svelte-highlight/languages/json';
	import sql from 'svelte-highlight/languages/sql';
	import rust from 'svelte-highlight/languages/rust';
	import go from 'svelte-highlight/languages/go';
	import java from 'svelte-highlight/languages/java';
	import kotlin from 'svelte-highlight/languages/kotlin';
	import swift from 'svelte-highlight/languages/swift';
	import cpp from 'svelte-highlight/languages/cpp';
	import markdown from 'svelte-highlight/languages/markdown';
	import yaml from 'svelte-highlight/languages/yaml';
	import php from 'svelte-highlight/languages/php';
	import dockerfile from 'svelte-highlight/languages/dockerfile';
	import plaintext from 'svelte-highlight/languages/plaintext';
	import { Collapsible } from '../../layout/accordion';
	import { Tab, TabList, TabPanel, Tabs } from '../../layout/tabs';
	import { twMerge } from 'tailwind-merge';

	const LANG_MAP: Record<string, any> = {
		typescript, javascript, python, css, xml, bash, shell, json, sql,
		rust, go, java, kotlin, swift, cpp, markdown, yaml, php, dockerfile, plaintext,
		svelte: typescript,
	};

	function getLang(langKey?: string) {
		return LANG_MAP[langKey ?? 'typescript'] ?? plaintext;
	}

	let { code, file, title, open = true, class: classes }: {
		code: string | CodeFile[];
		file?: string;
		title?: string;
		open?: boolean;
		class?: string;
	} = $props();

	const isMultiFile = $derived(Array.isArray(code) && (code as CodeFile[]).length > 1);
	const files = $derived(Array.isArray(code) ? code as CodeFile[] : [{ name: file ?? '', code: code as string }]);
</script>

{#snippet codeBlock()}
	<div class={twMerge('rounded-lg overflow-hidden border border-frame', classes)}>
		{#if isMultiFile}
			<Tabs initialTabId={files[0].name}>
				<TabList class="bg-secondary px-2">
					{#each files as f}
						<Tab id={f.name}>{f.name}</Tab>
					{/each}
				</TabList>
				{#each files as f}
					<TabPanel id={f.name}>
						<Highlight language={getLang(f.language)} code={f.code} />
					</TabPanel>
				{/each}
			</Tabs>
		{:else}
			{#if files[0].name}
				<div class="bg-secondary text-muted-contrast px-4 py-2 font-mono text-sm border-b border-frame">
					{files[0].name}
				</div>
			{/if}
			<Highlight language={getLang(files[0].language)} code={files[0].code} />
		{/if}
	</div>
{/snippet}

{#if title}
	<Collapsible {title} {open} small>
		{@render codeBlock()}
	</Collapsible>
{:else}
	{@render codeBlock()}
{/if}
