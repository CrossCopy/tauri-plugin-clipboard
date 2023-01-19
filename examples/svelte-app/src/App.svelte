<script lang="ts">
  import { execute, write_text, read_image } from "tauri-plugin-clipboard-api";
  import {
    createDir,
    writeBinaryFile,
    readBinaryFile,
  } from "@tauri-apps/api/fs";
  import { cacheDir } from "@tauri-apps/api/path";

  let response = "";

  function updateResponse(returnValue) {
    response +=
      `[${new Date().toLocaleTimeString()}]` +
      (typeof returnValue === "string"
        ? returnValue
        : JSON.stringify(returnValue)) +
      "<br>";
  }

  async function _execute() {
    // write_text("huakun zui shuai");

    const cacheDPath = await cacheDir();
    // const path = `${cacheDPath}tmp/y.png`;
    // readBinaryFile(path).then(async (data) => {
    //   console.log(data);
	//   const path = `${cacheDPath}tmp/z.png`;
	//   await writeBinaryFile(path, data);
    // });
    read_image().then(async (bytes: number[]) => {
		const path = `${cacheDPath}tmp/x.png`;
		console.log(bytes);
		await writeBinaryFile(path, new Uint8Array(bytes));
		// console.log(Buffer.from(bytes).toString('base64'));
		const uint8 = new Uint8Array(bytes); // your Uint8Array
		const base64 = btoa(String.fromCharCode.apply(null, uint8));
		console.log(base64); // this base64 image works
		
		// var decoder = new TextDecoder('utf8');
		// var b64encoded = btoa(decoder.decode(new Uint8Array(bytes)));
		// console.log(b64encoded);
		
    //   const imgData = new Uint8Array(bytes.bytes);
    //   console.log(imgData);
    //   await writeBinaryFile(path, imgData);
    });
    // execute().then(updateResponse).catch(updateResponse)
  }
</script>

<div>
  <button on:click={_execute}>Execute</button>
  <div>{@html response}</div>
</div>
