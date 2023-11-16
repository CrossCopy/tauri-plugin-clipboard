<script lang="ts">
	import {
		startMonitor,
		stopMonitor,
		listenToMonitorStatusUpdate,
		isMonitorRunning
	} from 'tauri-plugin-clipboard-api';
	let monitorRunning = false;

	listenToMonitorStatusUpdate((running) => {
		monitorRunning = running;
	});
</script>

<div class="flex items-center space-x-10">
	{#if monitorRunning}
		<button type="button" class="btn variant-filled-error btn-sm" on:click={stopMonitor}>
			Stop Monitor
		</button>
	{:else}
		<button type="button" class="btn variant-filled-success btn-sm" on:click={startMonitor}>
			Start Monitor
		</button>
	{/if}
	<p><strong>Monitor Running: {monitorRunning}</strong></p>
	<button
		type="button"
		class="btn variant-filled btn-sm"
		on:click={() => {
			isMonitorRunning().then((running) => {
				alert(`Monitor Running: ${running}`);
			});
		}}>Check Status</button
	>
</div>
