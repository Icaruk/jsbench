<script>
  import { state as bench } from "$lib/state.svelte.js";
  import SetupEditor from "$lib/components/SetupEditor.svelte";
  import TestCaseList from "$lib/components/TestCaseList.svelte";
  import IterationConfig from "$lib/components/IterationConfig.svelte";
  import ActionBar from "$lib/components/ActionBar.svelte";
  import ResultsChart from "$lib/components/ResultsChart.svelte";
  import logoIcon from "$lib/assets/favicon.svg";

  function formatOps(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
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
	<title>JSBench — JavaScript Benchmarking Tool</title>
	<meta name="description" content="Compare JavaScript performance across different approaches and iteration sizes. Client-side benchmarking with shareable results." />
	<link rel="canonical" href="https://jsbench.icaruk.dev/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://jsbench.icaruk.dev/" />
	<meta property="og:title" content="JSBench — JavaScript Benchmarking Tool" />
	<meta property="og:description" content="Compare JavaScript performance across different approaches and iteration sizes." />
	<meta property="og:image" content="https://jsbench.icaruk.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="JSBench — JavaScript Benchmarking Tool" />
	<meta name="twitter:description" content="Compare JavaScript performance across different approaches and iteration sizes." />
	<meta name="twitter:image" content="https://jsbench.icaruk.dev/og-image.svg" />
	{@html '<script type="application/ld+json">' + JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "JSBench",
		"url": "https://jsbench.icaruk.dev",
		"description": "Compare JavaScript performance across different approaches and iteration sizes.",
		"applicationCategory": "DeveloperApplication",
		"operatingSystem": "Any",
		"offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
	}) + '</script>'}
</svelte:head>

<div class="app">
  <header class="header">
    <div class="header-top">
      <img src={logoIcon} alt="" class="logo" />
      <h1>JSBench</h1>
    </div>
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
  .header-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    width: 32px;
    height: 32px;
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
