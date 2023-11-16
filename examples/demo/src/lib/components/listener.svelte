<script lang="ts">
	import type { UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount } from 'svelte';
	import {
		onClipboardUpdate,
		onImageUpdate,
		onTextUpdate,
		startListening
	} from 'tauri-plugin-clipboard-api';

	let text = '';
	let base64Image = '';
	let unlistenTextUpdate: UnlistenFn;
	let unlistenImageUpdate: UnlistenFn;
	let unlistenClipboard: UnlistenFn;
	onMount(async () => {
		unlistenTextUpdate = await onTextUpdate((newText) => {
			text = newText;
		});
		unlistenImageUpdate = await onImageUpdate((b64Str) => {
			base64Image = b64Str;
		});
		unlistenClipboard = await startListening();
		onClipboardUpdate(() => {
			console.log('plugin:clipboard://clipboard-monitor/update event received');
		});
	});

	onDestroy(() => {
		unlistenTextUpdate();
		unlistenClipboard();
	});
</script>

<h2>Clipboard Text</h2>
{#if text}
	<pre class="border p-2 rounded-lg">{text}</pre>
{/if}

<h2>Clipboard Image</h2>
{#if base64Image}
	<img width="300" src={`data:image/png;base64, ${base64Image}`} alt="" />
{/if}
