<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as monaco from 'monaco-editor';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

//	import { code as jsCode } from '$lib/js_code';
//	import { code as tsCode } from '$lib/ts_code';
//	import { code as phpCode } from '$lib/php_code';
//	import { code as pyCode } from '$lib/py_code';
//	import { code as htmlCode } from '$lib/html_code';

	import { githubAccessToken } from '$lib/tokenStore';
	import { repoMemory } from '$lib/repoStore';
	import { buildTreeFromZip } from '$lib/unzip';
	import { setTree, openFile, vfs } from '$lib/vfsStore';
	import FileTree from '$lib/FileTree.svelte';

	let tokenInput: string = '';
	let repoInput: string = '';

	async function downloadRepo() {
		repoMemory.update((s) => ({ ...s, status: 'loading', errorMessage: null }));
		try {
			const trimmed = repoInput.trim();
			if (!trimmed || !/^\S+\/\S+$/.test(trimmed)) {
				throw new Error('Enter repo as "owner/repo"');
			}
			let token: string | null = null;
			const unsub = githubAccessToken.subscribe((t) => (token = t));
			unsub();
			const params = new URLSearchParams({ repo: trimmed });
			if (token) params.set('token', token);
			const res = await fetch(`/api/github/zip?${params.toString()}`);
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`GitHub error ${res.status}: ${text}`);
			}
			const arrayBuf = await res.arrayBuffer();
			const bytes = new Uint8Array(arrayBuf);
			repoMemory.set({ zipBytes: bytes, status: 'success', errorMessage: null, repoName: trimmed });
			// Build VFS tree from zip and set it
			const root = buildTreeFromZip(bytes);
			setTree(root);
		} catch (e: any) {
			repoMemory.update((s) => ({ ...s, status: 'error', errorMessage: e?.message ?? 'Unknown error' }));
		}
	}

	let editorElement: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let model: monaco.editor.ITextModel;

	function loadCode(code: string, language: string) {
		model = monaco.editor.createModel(code, language);

		editor.setModel(model);
	}

	function guessLanguage(path: string): string {
		const lower = path.toLowerCase();
		if (lower.endsWith('.ts')) return 'typescript';
		if (lower.endsWith('.tsx')) return 'typescript';
		if (lower.endsWith('.js')) return 'javascript';
		if (lower.endsWith('.jsx')) return 'javascript';
		if (lower.endsWith('.json')) return 'json';
		if (lower.endsWith('.css')) return 'css';
		if (lower.endsWith('.scss')) return 'scss';
		if (lower.endsWith('.less')) return 'less';
		if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
		if (lower.endsWith('.md')) return 'markdown';
		if (lower.endsWith('.py')) return 'python';
		if (lower.endsWith('.php')) return 'php';
		if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
		if (lower.endsWith('.rs')) return 'rust';
		if (lower.endsWith('.go')) return 'go';
		if (lower.endsWith('.java')) return 'java';
		return 'plaintext';
	}

	$: if ($openFile.path && editor) {
		const language = guessLanguage($openFile.path);
		loadCode($openFile.content ?? '', language);
	}

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function (_: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

		editor = monaco.editor.create(editorElement, {
			automaticLayout: true,
			theme: 'vs-dark'
		});

		// loadCode(jsCode, 'javascript');
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});
</script>

<div class="flex h-screen w-full flex-col">
    <div class="flex flex-wrap items-end gap-2 p-2">
        <div class="flex flex-col gap-1">
            <label class="text-sm opacity-80">GitHub Access Token (optional)</label>
            <input class="border-2 p-1 w-80" type="password" bind:value={tokenInput} placeholder="ghp_..." on:change={() => githubAccessToken.set(tokenInput || null)} />
        </div>
        <div class="flex flex-col gap-1">
            <label class="text-sm opacity-80">Repository</label>
            <input class="border-2 p-1 w-80" type="text" bind:value={repoInput} placeholder="owner/repo" />
        </div>
        <button class="w-fit border-2 p-1" on:click={downloadRepo}>Download</button>
        {#if $repoMemory.status === 'loading'}
            <span class="text-sm opacity-80">Downloading…</span>
        {:else if $repoMemory.status === 'success'}
            <span class="text-sm text-green-500">Loaded {$repoMemory.repoName} ({$repoMemory.zipBytes?.length} bytes)</span>
        {:else if $repoMemory.status === 'error'}
            <span class="text-sm text-red-500">{$repoMemory.errorMessage}</span>
        {/if}
    </div>
    <div class="flex gap-x-1 p-1">
	<!--	<button class="w-fit border-2 p-1" on:click={() => loadCode(jsCode, 'javascript')}
			>JavaScript</button
		>
		<button class="w-fit border-2 p-1" on:click={() => loadCode(tsCode, 'typescript')}
			>TypeScript</button
	 	>
	 	<button class="w-fit border-2 p-1" on:click={() => loadCode(phpCode, 'php')}>PHP</button>
	 	<button class="w-fit border-2 p-1" on:click={() => loadCode(pyCode, 'python')}>Python</button>
		<button class="w-fit border-2 p-1" on:click={() => loadCode(htmlCode, 'html')}>HTML</button>  -->
	</div>
	<div class="flex flex-grow">
		<div class="w-64 border-r overflow-auto p-2">
			<FileTree node={$vfs.root} />
		</div>
		<div class="flex-grow" bind:this={editorElement} />
	</div>
</div>
