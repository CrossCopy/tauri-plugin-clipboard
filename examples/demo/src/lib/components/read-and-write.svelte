<script lang="ts">
	import {
		readText,
		readFiles,
		writeText,
		readImage,
		readImageBinary,
		readImageObjectURL,
		writeImage,
		clear
	} from 'tauri-plugin-clipboard-api';

	let text = '';
	let imageBase64 = '';
	let imageObjectUrl = '';
	let imageBinaryObjUrl = '';
	let files: string[] = [];

	const sampleBase64Image =
		'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';
</script>

<div class="flex-col space-y-4">
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			readText().then((t) => {
				text = t;
			});
		}}
	>
		Read Text
	</button>
	{#if text}
		<pre class="border p-2 rounded-lg">{text}</pre>
	{/if}
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			readFiles().then((_files) => {
				files = _files;
			});
		}}
	>
		Read Files
	</button>
	<ol class="list-decimal pl-6">
		{#each files as file}
			<li><code>{file}</code></li>
		{/each}
	</ol>
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await writeText('huakun zui shuai');
		}}
	>
		Write Text
	</button>
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			imageBase64 = await readImage();
		}}
	>
		Read Image (Base64)
	</button>
	{#if imageBase64}
		<img src={`data:image/png;base64, ${imageBase64}`} alt="" />
	{/if}
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			const binaryImage = await readImageBinary('Uint8Array');
			if (binaryImage instanceof Uint8Array) {
				const blob = new Blob([binaryImage]);
				imageBinaryObjUrl = URL.createObjectURL(blob);
			} else if (binaryImage instanceof Blob) {
				imageBinaryObjUrl = URL.createObjectURL(binaryImage);
			}
		}}
	>
		Read Image (Binary)
	</button>
	{#if imageBinaryObjUrl}
		<img src={imageBinaryObjUrl} alt="" />
	{/if}
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			imageObjectUrl = await readImageObjectURL();
		}}
	>
		Read Image (ObjectURL)
	</button>
	{#if imageObjectUrl}
		<img src={imageObjectUrl} alt="" />
	{/if}

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await writeImage(sampleBase64Image);
		}}
	>
		Write Image
	</button>
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clear();
		}}
	>
		Clear
	</button>
</div>
