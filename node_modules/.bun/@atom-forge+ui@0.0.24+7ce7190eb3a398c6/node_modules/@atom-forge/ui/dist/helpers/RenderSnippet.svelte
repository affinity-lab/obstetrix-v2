<script lang="ts">
	import type {Snippet} from "svelte";

	type Params = $$Generic<Record<string, any>>;

	let {
		snippet,
		args
	}: {
		snippet: Snippet<[Params]>,
		args: Params
	} = $props();
</script>
{@render snippet(args)}