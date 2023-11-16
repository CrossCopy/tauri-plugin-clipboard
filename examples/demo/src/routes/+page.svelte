<script lang="ts">
	import Listener from '$lib/components/listener.svelte';
	import Monitor from '$lib/components/monitor.svelte';
	import ReadAndWrite from '$lib/components/read-and-write.svelte';
</script>

<div class="flex-col space-y-5">
	<h1 class="text-3xl">Read and Write Clipboard</h1>
	<ReadAndWrite />
	<h1 class="text-3xl">Clipboard Monitoring</h1>
	<Monitor />
	<Listener />
</div>
