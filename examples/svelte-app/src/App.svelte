<script lang="ts">
  import {
    write_text,
    read_text,
    read_image,
    write_image,
  } from "tauri-plugin-clipboard-api";

  const sample_base64_image =
    "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";
  let message = "";
  let curBase64Image = "";
  let response = "";

  function updateResponse(returnValue) {
    response +=
      `[${new Date().toLocaleTimeString()}]` +
      (typeof returnValue === "string"
        ? returnValue
        : JSON.stringify(returnValue)) +
      "<br>";
  }

  async function readText() {
    read_text().then((text) => {
      message = text;
    });
  }

  async function writeText() {
    write_text("huakun zui shuai").then(() => {
      message = `"huakun zui shuai" should be written to your clipboard`;
    });
  }

  function readImage() {
    read_image()
      .then((bytes) => {
        curBase64Image = bytes;
      })
      .catch((err) => {
        alert(err);
        message = "Probably no image in your clipboard";
      });
  }

  async function writeImage() {
    write_image(sample_base64_image).then(() => {
      message =
        'Image should be written to your clipboard, try paste it somewhere, or click "Read Image"';
    });
  }
</script>

<div>
  <h1>Sample App</h1>
  <h2>Click on each button to see the result</h2>
  <button on:click={readText}>Read Text</button>
  <button on:click={writeText}>Write Text</button>
  <button on:click={readImage}>Read Image</button>
  <button on:click={writeImage}>Write Image</button>
  <br />
  {#if message.length > 0}
    <h3>{message}</h3>
  {/if}

  {#if curBase64Image.length > 0}
    <img src={`data:image/png;base64, ${curBase64Image}`} alt="" />
  {/if}
</div>
