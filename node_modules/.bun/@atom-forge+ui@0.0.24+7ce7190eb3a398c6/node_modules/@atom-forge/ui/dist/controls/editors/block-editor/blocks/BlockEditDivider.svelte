<script lang="ts">
	import { getBlockAPI } from '../context.js';
	import type { BlockController } from '../types.js';

	let { id }: { id: string; data: null } = $props();

	const api = getBlockAPI();

	$effect(() => {
		const controller: BlockController = {
			focus() {},
		};
		api.register(id, controller);
		return () => api.unregister(id);
	});
</script>

<!-- Editor mode: render nothing, divider is shown in collapsed header only -->
