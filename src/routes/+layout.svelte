<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import faviconRunning from '$lib/assets/favicon-running.svg';
	import { state as bench } from '$lib/state.svelte.js';

	let { children } = $props();

	let iconHref = $derived(bench.running ? faviconRunning : favicon);
</script>

<svelte:head>
	<link rel="icon" href={iconHref} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Merriweather+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
</svelte:head>
{@render children()}
