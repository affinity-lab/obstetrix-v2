<script module lang="ts">
	export type BlockCodeFile = {
		filename: string;
		language: string;
		source:   string;
	};

	export type CodeBlockData = {
		files: BlockCodeFile[];
		title: string;
		open:  boolean;
	};

	export const LANGUAGES: { value: string; label: string }[] = [
		{ value: 'typescript',  label: 'TypeScript'  },
		{ value: 'javascript',  label: 'JavaScript'  },
		{ value: 'svelte',      label: 'Svelte'      },
		{ value: 'python',      label: 'Python'      },
		{ value: 'css',         label: 'CSS'         },
		{ value: 'xml',         label: 'HTML / XML'  },
		{ value: 'bash',        label: 'Bash'        },
		{ value: 'shell',       label: 'Shell'       },
		{ value: 'json',        label: 'JSON'        },
		{ value: 'sql',         label: 'SQL'         },
		{ value: 'rust',        label: 'Rust'        },
		{ value: 'go',          label: 'Go'          },
		{ value: 'java',        label: 'Java'        },
		{ value: 'kotlin',      label: 'Kotlin'      },
		{ value: 'swift',       label: 'Swift'       },
		{ value: 'cpp',         label: 'C++'         },
		{ value: 'markdown',    label: 'Markdown'    },
		{ value: 'yaml',        label: 'YAML'        },
		{ value: 'php',         label: 'PHP'         },
		{ value: 'dockerfile',  label: 'Dockerfile'  },
		{ value: 'plaintext',   label: 'Plain text'  },
	];
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import { Plus, X, PanelTopOpen, PanelTopClose } from 'lucide-svelte';
	import { getBlockAPI } from '../context.js';

	let { id, data }: { id: string; data: CodeBlockData | null } = $props();

	const api = getBlockAPI();

	const DEFAULT_FILE: BlockCodeFile = { filename: '', language: 'typescript', source: '' };

	let files = $state<BlockCodeFile[]>(untrack(() => (data?.files ?? [{ ...DEFAULT_FILE }]).map(f => ({ ...f }))));
	let title = $state(untrack(() => data?.title ?? ''));
	let open  = $state(untrack(() => data?.open  ?? true));

	$effect(() => {
		const d = data;
		untrack(() => {
			if (!d) return;
			if (d.title !== title) title = d.title;
			if (d.open  !== open)  open  = d.open;
			const incoming = JSON.stringify(d.files);
			if (incoming !== JSON.stringify(files)) {
				files = d.files.map(f => ({ ...f }));
			}
		});
	});

	$effect(() => {
		api.register(id, { focus() {} });
		return () => api.unregister(id);
	});

	function save() {
		api.updateData(id, { files: files.map(f => ({ ...f })), title, open });
	}

	function addFile() {
		files = [...files, { ...DEFAULT_FILE }];
		save();
	}

	function removeFile(i: number) {
		if (files.length <= 1) return;
		files = files.filter((_, idx) => idx !== i);
		save();
	}

	function setFile<K extends keyof BlockCodeFile>(i: number, key: K, val: BlockCodeFile[K]) {
		files = files.map((f, idx) => idx === i ? { ...f, [key]: val } : f);
		save();
	}

	function autogrow(node: HTMLTextAreaElement) {
		function resize() { node.style.height = 'auto'; node.style.height = node.scrollHeight + 'px'; }
		resize();
		node.addEventListener('input', resize);
		return { destroy: () => node.removeEventListener('input', resize) };
	}

	const selectCls = 'bg-control border border-frame rounded px-1.5 py-0.5 text-xs text-canvas-contrast outline-none focus:ring-1 ring-accent cursor-pointer';
	const inputCls  = 'bg-transparent border-none outline-none text-sm text-canvas-contrast placeholder:text-muted-contrast/50 min-w-0 flex-1';
</script>

<div class="space-y-2 py-1">
	<!-- Header: title + open toggle -->
	<div class="flex items-center gap-2 px-1">
		<input
			bind:value={title}
			oninput={save}
			placeholder="Title (for collapsible header)…"
			class="{inputCls} text-base font-medium"
		/>
		<button
			class={twMerge(
				'flex items-center gap-1 px-2 py-0.5 rounded text-xs border border-frame transition-colors cursor-pointer shrink-0',
				open ? 'text-accent border-accent/40 bg-accent/5' : 'text-muted-contrast hover:text-canvas-contrast',
			)}
			onclick={() => { open = !open; save(); }}
			title={open ? 'Starts open' : 'Starts closed'}
		>
			{#if open}
				<PanelTopOpen size={12}/> Open
			{:else}
				<PanelTopClose size={12}/> Closed
			{/if}
		</button>
	</div>

	<!-- Files -->
	{#each files as file, i}
		<div class="rounded-lg border border-frame overflow-hidden">
			<!-- File header -->
			<div class="flex items-center gap-1.5 px-2 py-1.5 bg-muted/30 border-b border-frame">
				<input
					value={file.filename}
					oninput={(e) => setFile(i, 'filename', e.currentTarget.value)}
					placeholder="filename.ts"
					class="font-mono text-xs text-canvas-contrast bg-transparent border-none outline-none flex-1 min-w-0 placeholder:text-muted-contrast/40"
				/>
				<select
					class={selectCls}
					onchange={(e) => setFile(i, 'language', e.currentTarget.value)}
				>
					{#each LANGUAGES as lang}
						<option value={lang.value} selected={file.language === lang.value}>{lang.label}</option>
					{/each}
				</select>
				{#if files.length > 1}
					<button
						class="flex items-center justify-center w-5 h-5 rounded text-muted-contrast hover:text-error hover:bg-error/10 transition-colors cursor-pointer shrink-0"
						onclick={() => removeFile(i)}
						title="Remove file"
					>
						<X size={11}/>
					</button>
				{/if}
			</div>

			<!-- Source textarea -->
			<textarea
				use:autogrow
				oninput={(e) => setFile(i, 'source', e.currentTarget.value)}
				placeholder="// paste your code here…"
				rows={3}
				spellcheck={false}
				class="w-full bg-canvas/60 font-mono text-xs text-muted-contrast placeholder:text-muted-contrast/30 px-3 py-2 border-none outline-none resize-none overflow-hidden leading-relaxed block"
			>{file.source}</textarea>
		</div>
	{/each}

	<!-- Add file -->
	<button
		class="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-contrast hover:text-canvas-contrast hover:bg-secondary transition-colors cursor-pointer"
		onclick={addFile}
	>
		<Plus size={12}/> Add file
	</button>
</div>

