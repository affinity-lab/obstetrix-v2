<script lang="ts">
	import { ProseCallout } from '../../../content/prose';

	type CalloutColor = 'info' | 'warning' | 'success' | 'error' | 'tip' | 'note';
	let { data }: { data: { icon: string; color: CalloutColor; title: string; text: string } | null } = $props();
</script>

<ProseCallout
	variant={data?.color ?? 'info'}
	icon={data?.icon}
	title={data?.title}
	content={data?.text}
/>


