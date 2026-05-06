<script>
	import { state as bench } from '$lib/state.svelte.js';
	import SetupEditor from '$lib/components/SetupEditor.svelte';
	import TestCaseList from '$lib/components/TestCaseList.svelte';
	import IterationConfig from '$lib/components/IterationConfig.svelte';
	import ActionBar from '$lib/components/ActionBar.svelte';
	import ResultsChart from '$lib/components/ResultsChart.svelte';

	function formatOps(n) {
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
		if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
		return n.toFixed(0);
	}

	let hashReady = $state(false);

	$effect(() => {
		bench.setupCode;
		bench.testCases;
		bench.iterations;
		bench.minTime;
		if (!hashReady) {
			hashReady = true;
			return;
		}
		bench.syncHash();
	});
</script>

<svelte:head>
	<title>JSBench — JavaScript Benchmarking</title>
	<meta name="description" content="Compare JavaScript performance across different approaches and iteration sizes" />
</svelte:head>

<div class="app">
	<header class="header">
		<h1>JSBench</h1>
		<p>Compare JavaScript performance across iteration sizes</p>
	</header>

	<section class="section">
		<SetupEditor />
	</section>

	<section class="section">
		<IterationConfig />
	</section>

	<section class="section">
		<TestCaseList />
	</section>

	<section class="section">
		<ActionBar />
	</section>

	{#if bench.results}
		<section class="section">
			<ResultsChart results={bench.results} />
		</section>
		<section class="section results-wrap">
			{#each bench.results as group}
				{@const sorted = [...group.results].sort((a, b) => b.opsPerSec - a.opsPerSec)}
				{@const fastest = sorted[0]}
				<div class="group">
					<div class="group-header">N = {group.iterationSize.toLocaleString()}</div>
					<table class="group-table">
					<tbody>
						{#each sorted as result, i}
							<tr class:fastest={i === 0}>
								<td class="rank">#{i + 1}</td>
								<td class="name">{result.name}</td>
								<td class="ops">{formatOps(result.opsPerSec)}</td>
								<td class="unit">ops/sec</td>
								{#if i > 0}
									<td class="slower">{((fastest.opsPerSec / result.opsPerSec - 1) * 100).toFixed(0)}% slower</td>
								{:else}
									<td class="slower"></td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
				</div>
			{/each}
		</section>
	{/if}
</div>

<style>
	.app {
		max-width: 900px;
		margin: 0 auto;
		padding: 24px 16px 80px;
	}
	.header {
		margin-bottom: 32px;
	}
	.header h1 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		color: #e0e0e0;
		letter-spacing: -0.5px;
	}
	.header p {
		margin: 4px 0 0;
		color: #888;
		font-size: 14px;
	}
	.section {
		margin-bottom: 24px;
	}
	.results-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.group {
		border: 1px solid #333;
		border-radius: 4px;
		overflow: hidden;
		min-width: 320px;
		flex: 1;
	}
	.group-header {
		padding: 8px 12px;
		font-size: 12px;
		color: #777;
		border-bottom: 1px solid #333;
		font-family: monospace;
	}
	.group-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
		font-family: monospace;
	}
	.group-table tr {
		border-bottom: 1px solid #222;
	}
	.group-table tr:last-child {
		border-bottom: none;
	}
	.group-table td {
		padding: 6px 12px;
		vertical-align: middle;
	}
	.rank {
		color: #555;
		width: 32px;
	}
	.name {
		color: #ccc;
	}
	.ops {
		color: #8ac4ff;
		text-align: right;
		font-weight: 600;
	}
	.unit {
		color: #666;
		font-size: 11px;
	}
	.slower {
		color: #ff8888;
		font-size: 11px;
		text-align: right;
		min-width: 70px;
	}
	.fastest .rank {
		color: #6a9a6a;
	}
	.fastest .name {
		color: #e0e0e0;
	}
</style>
