<script lang="ts">
  import {
    execute,
    write_text,
    read_image,
    write_image,
  } from "tauri-plugin-clipboard-api";
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
    const image_base64 =
      "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAOCAYAAADwikbvAAABaUlEQVR4AZ1Sy07CQBQ9RTDACgOJMTFQNSbVL1A3Pnbq2sc3yEL9EXXTf1DXJuzUleELtIYEgoYYExZ1Y4lg6r13bluEHZOZO2fOPefOTDuWbdshJmypCX1iS0vUkJmycLRdwu5aAcvzWYDO1OgEqNW/cPPQRf+XCNXyFB97diYD92wBTjnH/L9h0eqlHaB61cKn36eV6SmeeEf3lI15XoLFAjTwfk4lB/d8EdPpJCvmw60iOCnnJEM4ZieSulPO4mCzSMh0Me+tF0bkoclqTPYCWKs0xLxayfO3IS6RGWSiKWXwCmlJKF3MgihYWoKgosQW5QYDw7FGzM/tb8ZiMPVlGQeW82Ci0enxJEPM/B+ht45E0DZcjHGt7msG5s63j114b4GQlsQkDBfz3gOwNsrKzj90j+plEx49hFBPgHiGtFcqfnLRAmuFoBC/MMLgx3K8U8L+RgFLc/Q8iWx+9HD35OP6fvx5/gH+gWM6h22U4AAAAABJRU5ErkJggg";
    write_image(image_base64).then(async (bytes) => {
      console.log(bytes);
    });
    // const path = `${cacheDPath}tmp/y.png`;
    // readBinaryFile(path).then(async (data) => {
    //   console.log(data);
    //   const path = `${cacheDPath}tmp/z.png`;
    //   await writeBinaryFile(path, data);
    // });
      // const path = `${cacheDPath}tmp/x.png`;
      // await writeBinaryFile(path, new Uint8Array(bytes));
    // read_image().then(async (bytes) => {
    //   console.log(bytes);
    // });
    // const path = `${cacheDPath}tmp/x.png`;
    // console.log(bytes);
    // await writeBinaryFile(path, new Uint8Array(bytes));
    // // console.log(Buffer.from(bytes).toString('base64'));
    // const uint8 = new Uint8Array(bytes); // your Uint8Array
    // const base64 = btoa(String.fromCharCode.apply(null, uint8));
    // console.log(base64); // this base64 image works

    // var decoder = new TextDecoder('utf8');
    // var b64encoded = btoa(decoder.decode(new Uint8Array(bytes)));
    // console.log(b64encoded);

    //   const imgData = new Uint8Array(bytes.bytes);
    //   console.log(imgData);
    //   await writeBinaryFile(path, imgData);
    // });
    // execute().then(updateResponse).catch(updateResponse)
  }
</script>

<div>
  <button on:click={_execute}>Execute</button>
  <div>{@html response}</div>
</div>
