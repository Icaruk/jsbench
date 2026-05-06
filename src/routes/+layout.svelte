<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import faviconRunning from '$lib/assets/favicon-running.svg';
	import { state as bench } from '$lib/state.svelte.js';

	let { children } = $props();

	let iconHref = $derived(bench.running ? faviconRunning : favicon);
</script>

<svelte:head><link rel="icon" href={iconHref} /></svelte:head>
{@render children()}
