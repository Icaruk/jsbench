<script>
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";

  let pct = $derived(bench.progressTotal > 0 ? Math.round((bench.progressCurrent / bench.progressTotal) * 100) : 0);
</script>

<SectionTitle title="Actions" />

<div class="action-bar">
  <div class="bar-row">
    <button
      class="mode-btn"
      class:active={bench.parallel}
      onclick={() => (bench.parallel = !bench.parallel)}
      disabled={bench.running}
    >
      {bench.parallel ? "🚀 Parallel" : "🐌 Serial"}
    </button>

    <button
      class="run-btn"
      onclick={() => bench.runBenchmark()}
      disabled={bench.running || bench.testCases.length === 0}
    >
      {bench.running ? bench.progress || "Running..." : "▶ Run Benchmark"}
    </button>
  </div>

  {#if bench.error}
    <div class="error">{bench.error}</div>
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
  .action-bar {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .bar-row {
    display: flex;
    gap: var(--space-2);
  }
  .mode-btn {
    background: var(--color-serial-bg);
    border: 1px solid var(--color-serial-border);
    color: var(--color-serial);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-sm);
    font-family: var(--font-mono);
    white-space: nowrap;
    transition:
      background 0.2s,
      border-color 0.2s,
      color 0.2s;
    &:hover:not(:disabled) {
      border-color: var(--color-serial);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    &.active {
      background: var(--color-parallel-bg);
      border-color: var(--color-parallel-border);
      color: var(--color-parallel);
      &:hover:not(:disabled) {
        border-color: var(--color-parallel);
      }
    }
  }
  .run-btn {
    flex: 1;
    background: var(--color-accent-bg);
    border: 1px solid var(--color-accent-border);
    color: var(--color-accent);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-sm);
    font-weight: 600;
    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .error {
    color: var(--color-error);
    font-size: var(--font-sm);
    background: var(--color-error-bg);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-error-border);
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
