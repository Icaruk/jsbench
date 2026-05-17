<script>
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";

  let pct = $derived(bench.progressTotal > 0 ? Math.round((bench.progressCurrent / bench.progressTotal) * 100) : 0);
</script>

<SectionTitle title="Actions" />

<div class="section-content">
  <div class="bar-row">
    <button
      class="btn--serial"
      class:active={bench.parallel}
      onclick={() => (bench.parallel = !bench.parallel)}
      disabled={bench.running}
    >
      {bench.parallel ? "🚀 Parallel" : "🐌 Serial"}
    </button>

    <button
      class="btn--accent run-btn"
      onclick={() => bench.runBenchmark()}
      disabled={bench.running || bench.testCases.length === 0}
    >
      {bench.running ? bench.progress || "Running..." : "▶ Run Benchmark"}
    </button>
  </div>

  {#if bench.error}
    <div class="error-block error-block--bordered">{bench.error}</div>
  {/if}
</div>

{#if bench.running}
  <div class="progress-container">
    <div
      class="progress-bar"
      style="width: {pct}%"
    ></div>
    <span class="progress-label">{pct}%</span>
  </div>
{/if}

<style>
  .section-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .bar-row {
    display: flex;
    gap: var(--space-2);
  }
  .run-btn {
    flex: 1;
    padding: var(--space-2) var(--space-4);
  }
  .progress-container {
    position: relative;
    height: var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    margin-top: var(--space-5);
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--color-accent-bg), var(--color-accent-bright));
    transition: width 0.3s ease;
  }
  .progress-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    font-weight: 600;
  }
</style>
