<script>
  import { state as bench } from "$lib/state.svelte.js";
  import SetupEditor from "$lib/components/SetupEditor.svelte";
  import TestCaseList from "$lib/components/TestCaseList.svelte";
  import IterationConfig from "$lib/components/IterationConfig.svelte";
  import ActionBar from "$lib/components/ActionBar.svelte";
  import ResultsChart from "$lib/components/ResultsChart.svelte";
  import SectionTitle from "$lib/components/SectionTitle.svelte";
  import logoIcon from "$lib/assets/favicon.svg";

  let copied = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bench.getShareableURL());
      copied = true;
      setTimeout(() => { copied = false; }, 2000);
    } catch { /* noop */ }
  }

  function formatOps(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
    return n.toFixed(0);
  }

  function formatEstimate(sec) {
    if (sec < 1) return `${(sec * 1000).toFixed(0)}ms`;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    return `${(sec / 60).toFixed(1)}min`;
  }

  let estimatedSec = $derived(bench.getEstimatedTime());

  $effect(() => {
    bench.setupCode;
    bench.testCases;
    bench.iterations;
    bench.minTime;
    bench.parallel;
    bench.title;
    const timer = setTimeout(() => bench.syncHash(), 1500);
    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>{bench.title ? `${bench.title} — JSBench` : 'JSBench — JavaScript Benchmarking Tool'}</title>
  <meta
    name="description"
    content="Compare JavaScript performance across different approaches and iteration sizes. Client-side benchmarking with shareable results."
  />
  <meta
    name="robots"
    content="index, follow"
  />
  <link
    rel="canonical"
    href="https://jsbench.icaruk.dev/"
  />
  <meta
    property="og:type"
    content="website"
  />
  <meta
    property="og:url"
    content="https://jsbench.icaruk.dev/"
  />
  <meta
    property="og:title"
    content="JSBench — JavaScript Benchmarking Tool"
  />
  <meta
    property="og:description"
    content="Compare JavaScript performance across different approaches and iteration sizes."
  />
  <meta
    property="og:image"
    content="https://jsbench.icaruk.dev/og-image.png"
  />
  <meta
    property="og:image:width"
    content="1200"
  />
  <meta
    property="og:image:height"
    content="630"
  />
  <meta
    name="twitter:card"
    content="summary_large_image"
  />
  <meta
    name="twitter:title"
    content="JSBench — JavaScript Benchmarking Tool"
  />
  <meta
    name="twitter:description"
    content="Compare JavaScript performance across different approaches and iteration sizes."
  />
  <meta
    name="twitter:image"
    content="https://jsbench.icaruk.dev/og-image.png"
  />
  {@html '<script type="application/ld+json">' +
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "JSBench",
      url: "https://jsbench.icaruk.dev",
      description: "Compare JavaScript performance across different approaches and iteration sizes.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    }) +
    "</script>"}
</svelte:head>

<div class="app">
  <header class="header">
    <div class="header-top">
        <a href="/" class="logo-link" onclick={() => { location.hash = ''; location.reload(); }}>
          <img
            src={logoIcon}
            alt=""
            class="logo"
          />
          <h1>JSBench</h1>
        </a>
      <button
        class="copy-btn"
        onclick={handleCopy}
      >
        {copied ? "✓ Copied!" : "📋 Share"}
      </button>
    </div>
    <p>Compare JavaScript performance at scale</p>
  </header>

  <section class="section">
    <IterationConfig />
  </section>
  
  <section class="section">
    <SetupEditor />
  </section>

  <section class="section">
    <TestCaseList />
  </section>

  
  <section class="section">
    <ActionBar />
    <p class="time-estimate">Estimated time: ~{formatEstimate(estimatedSec)}</p>
  </section>

  {#if bench.results}
    <section class="section">
      <SectionTitle title="Results" />
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
    --gap-section: var(--space-3);
    --gap-element: var(--space-1);
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-5) var(--space-4) 80px;
    display: flex;
    flex-direction: column;
    gap: var(--gap-section);
  }
  .header {
    margin-bottom: 0;
  }
  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    text-decoration: none;
  }
  .logo {
    width: var(--space-6);
    height: var(--space-6);
  }
  .header h1 {
    margin: 0;
    font-size: var(--font-heading);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.5px;
  }
  .header p {
    margin: var(--space-1) 0 0;
    color: var(--color-text-muted);
    font-size: var(--font-sm);
  }
  .copy-btn {
    background: var(--color-warn-bg);
    border: 1px solid var(--color-warn-border);
    color: var(--color-warn);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-xs);
    font-family: var(--font-mono);
    &:hover {
      background: var(--color-warn-hover);
    }
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--gap-element);
  }
  .time-estimate {
    margin: var(--space-2) 0;
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    text-align: center;
  }
  .results-wrap {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-4);
  }
  .group {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    min-width: 320px;
    flex: 1 1 calc(50% - var(--space-4) / 2);
    max-width: calc(50% - var(--space-4) / 2);
  }
  .group-header {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-md);
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
  }
  .group-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-sm);
    font-family: var(--font-mono);
  }
  .group-table tr {
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .group-table tr:last-child {
    border-bottom: none;
  }
  .group-table td {
    padding: var(--space-2) var(--space-3);
    vertical-align: middle;
  }
  .rank {
    color: var(--color-text-dim);
    width: var(--space-6);
  }
  .name {
    color: var(--color-text-secondary);
  }
  .ops {
    color: var(--color-accent);
    text-align: right;
    font-weight: 600;
  }
  .unit {
    color: var(--color-text-dim);
    font-size: var(--font-xs);
  }
  .slower {
    color: var(--color-error-light);
    font-size: var(--font-xs);
    text-align: right;
    min-width: 70px;
  }
  .fastest .rank {
    color: var(--color-success);
  }
  .fastest .name {
    color: var(--color-text);
  }
</style>
