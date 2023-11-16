<script lang="ts">
	import Listener from '$lib/components/listener.svelte';
	import Monitor from '$lib/components/monitor.svelte';
	import ReadAndWrite from '$lib/components/read-and-write.svelte';
	// import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';

	// let tabSet: number = 0;
</script>

<!-- <TabGroup>
	<Tab bind:group={tabSet} name="tab1" value={0}>Monitor</Tab>
	<Tab bind:group={tabSet} name="tab2" value={1}>Read and Write</Tab>
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<h1 class="text-3xl">Clipboard Monitoring</h1>
			<div class="flex-col space-y-5">
				<Monitor />
				<Listener />
			</div>
		{:else if tabSet === 1}
			<h1 class="text-3xl">Read Clipboard</h1>
			<ReadAndWrite />
		{/if}
	</svelte:fragment>
</TabGroup> -->
<div class="flex-col space-y-5">
	<h1 class="text-3xl">Clipboard Monitoring</h1>
	<ReadAndWrite />
	<h1 class="text-3xl">Read Clipboard</h1>
	<Monitor />
	<Listener />
</div>
