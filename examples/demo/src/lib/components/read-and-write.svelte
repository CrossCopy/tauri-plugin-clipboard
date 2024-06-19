<script lang="ts">
	import clipboard from 'tauri-plugin-clipboard-api';
	let text = '';
	let rtf = '';
	let html = '';
	let imageBase64 = '';
	let imageObjectUrl = '';
	let imageBinaryObjUrl = '';
	let files: string[] = [];
	let filesUris: string[] = [];

	const sampleBase64Image =
		'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';
	// convert sampleBase64Image to number[]
	const sampleImageBinaryArray = Array.from(atob(sampleBase64Image), (c) => c.charCodeAt(0));
</script>

<div class="flex-col space-y-4">
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			clipboard.readText().then((t) => {
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
			clipboard
				.readRtf()
				.then((t) => {
					rtf = t;
				})
				.catch(alert);
		}}
	>
		Read RTF
	</button>
	{#if rtf}
		<pre class="border p-2 rounded-lg">{rtf}</pre>
	{/if}

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			clipboard.readHtml().then((t) => {
				html = t;
			});
		}}
	>
		Read HTML
	</button>

	<!-- set inner html -->
	<div>{@html html}</div>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			clipboard.readFiles().then((_files) => {
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
		on:click={() => {
			clipboard.readFilesURIs().then((_files) => {
				filesUris = _files;
			});
		}}
	>
		Read Files URIs
	</button>
	<ol class="list-decimal pl-6">
		{#each filesUris as file}
			<li><code>{file}</code></li>
		{/each}
	</ol>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeText('huakun zui shuai');
		}}
	>
		Write Text
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			clipboard
				.writeFilesURIs(['file:///Users/hacker/Dev/brain/docs/notes/Analysis/LaunchApp/raycast.md'])
				.catch(alert);
		}}
	>
		Write Files URIs
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			clipboard
				.writeFiles(['/Users/hacker/Dev/brain/docs/notes/Analysis/LaunchApp/raycast.md'])
				.catch(alert);
		}}
	>
		Write Files Paths
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeHtml(
				'<h1 style="color:red; font-size:larger;">HTML written by writeHtml</h1>'
			);
		}}
	>
		Write HTML
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeRtf(`{\\rtf1\\ansi\\ansicpg1252\\cocoartf2761
\\cocoatextscaling0\\cocoaplatform0{\\fonttbl\\f0\\fswiss\\fcharset0 Arial-BoldMT;\\f1\\froman\\fcharset0 Times-Roman;}
{\\colortbl;\\red255\\green255\\blue255;\\red230\\green0\\blue14;}
{\\*\\expandedcolortbl;;\\cssrgb\\c93213\\c13483\\c4656;}
\\deftab720
\\pard\\pardeftab720\\partightenfactor0

\\f0\\b\\fs48 \\cf2 \\up0 \\nosupersub \\ulnone hello
\\f1\\b0\\fs24 \\cf2 \\
World}`);
		}}
	>
		Write RTF
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeHtmlAndText(
				'<h1 style="color:red; font-size:larger;">HTML written by <code>writeHtmlAndText</code></h1>',
				'HTML written by writeHtmlAndText'
			);
		}}
	>
		Write HTML and Text
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			clipboard
				.readImageBase64()
				.then((data) => {
					imageBase64 = data;
				})
				.catch(alert);
		}}
	>
		Read Image (Base64)
	</button>
	{#if imageBase64}
		<img src={`data:image/png;base64, ${imageBase64}`} width="300" alt="" />
	{/if}
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			try {
				const binaryImage = await clipboard.readImageBinary('Uint8Array');
				if (binaryImage instanceof Uint8Array) {
					const blob = new Blob([binaryImage]);
					imageBinaryObjUrl = URL.createObjectURL(blob);
				} else if (binaryImage instanceof Blob) {
					imageBinaryObjUrl = URL.createObjectURL(binaryImage);
				}
			} catch (error) {
				alert(error);
			}
		}}
	>
		Read Image (Binary)
	</button>
	{#if imageBinaryObjUrl}
		<img src={imageBinaryObjUrl} width="300" alt="" />
	{/if}
	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			clipboard
				.readImageObjectURL()
				.then((data) => {
					imageObjectUrl = data;
				})
				.catch(alert);
		}}
	>
		Read Image (ObjectURL)
	</button>
	{#if imageObjectUrl}
		<img src={imageObjectUrl} width="300" alt="" />
	{/if}

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeImageBase64(sampleBase64Image);
		}}
	>
		Write Image (Base64)
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={async () => {
			await clipboard.writeImageBinary(sampleImageBinaryArray);
		}}
	>
		Write Image (Binary)
	</button>

	<button
		type="button"
		class="btn variant-filled block btn-sm"
		on:click={() => {
			return clipboard.clear();
		}}
	>
		Clear
	</button>
</div>
