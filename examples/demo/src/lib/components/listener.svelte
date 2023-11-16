<script lang="ts">
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount } from 'svelte';
	import {
		onClipboardUpdate,
		onImageUpdate,
		onTextUpdate,
		onFilesUpdate,
		startListening
	} from 'tauri-plugin-clipboard-api';

	let text = '';
	let files: string[] = [];
	let base64Image = '';
	let unlistenTextUpdate: UnlistenFn;
	let unlistenImageUpdate: UnlistenFn;
	let unlistenClipboard: UnlistenFn;
	let unlistenFiles: UnlistenFn;
	onMount(async () => {
		unlistenTextUpdate = await onTextUpdate((newText) => {
			text = newText;
		});
		unlistenImageUpdate = await onImageUpdate((b64Str) => {
			base64Image = b64Str;
		});
		unlistenFiles = await onFilesUpdate((newFiles) => {
			files = newFiles;
		});
		unlistenClipboard = await startListening();
		onClipboardUpdate(() => {
			console.log('plugin:clipboard://clipboard-monitor/update event received');
		});
	});

	onDestroy(() => {
		unlistenTextUpdate();
		unlistenImageUpdate();
		unlistenClipboard();
		unlistenFiles();
	});
</script>

<h2>Clipboard Text</h2>
{#if text}
	<pre class="border p-2 rounded-lg">{text}</pre>
{/if}

<h2>Clipboard Files</h2>
{#if files}
	<ol class="list-decimal pl-6">
		{#each files as file}
			<li><code>{file}</code></li>
		{/each}
	</ol>
{/if}

<h2>Clipboard Image</h2>
{#if base64Image}
	<img width="300" src={`data:image/png;base64, ${base64Image}`} alt="" />
{/if}
