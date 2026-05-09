<script>
  import { state as bench } from "$lib/state.svelte.js";

  let copied = $state(false);

  let pct = $derived(bench.progressTotal > 0 ? Math.round((bench.progressCurrent / bench.progressTotal) * 100) : 0);

  let estimatedSec = $derived(bench.getEstimatedTime());

  function formatEstimate(sec) {
    if (sec < 1) return `${(sec * 1000).toFixed(0)}ms`;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    return `${(sec / 60).toFixed(1)}min`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(bench.getShareableURL());
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      /* noop */
    }
  }
</script>

<div class="action-bar">
  <button
    class="run-btn"
    onclick={() => bench.runBenchmark()}
    disabled={bench.running || bench.testCases.length === 0}
  >
    {bench.running ? bench.progress || "Running..." : "▶ Run Benchmark"}
  </button>

  <label class="parallel-toggle" class:active={bench.parallel}>
    <input
      type="checkbox"
      bind:checked={bench.parallel}
      disabled={bench.running}
    />
    <span class="toggle-track"><span class="toggle-thumb"></span></span>
    Parallel
  </label>

  <span class="time-estimate">~{formatEstimate(estimatedSec)}</span>

  <button
    class="copy-btn"
    onclick={handleCopy}
  >
    {copied ? "✓ Copied!" : "📋 Copy URL"}
  </button>

  {#if bench.parallel}
    <div class="parallel-note">May reduce precision due to CPU contention</div>
  {/if}

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
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .run-btn {
    background: #1a3a5c;
    border: 1px solid #2a5a8c;
    color: #8ac4ff;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    &:hover:not(:disabled) {
      background: #1e4a6e;
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .copy-btn {
    background: #2a2a1a;
    border: 1px solid #4a4a2a;
    color: #c4c48a;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    &:hover {
      background: #3a3a2a;
    }
  }
  .error {
    color: #ff6666;
    font-size: 12px;
    background: #2a1a1a;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #4a2a2a;
  }
  .parallel-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #888;
    cursor: pointer;
    user-select: none;
  }
  .parallel-toggle input {
    display: none;
  }
  .toggle-track {
    display: inline-block;
    width: 32px;
    height: 18px;
    background: #333;
    border-radius: 9px;
    position: relative;
    transition: background 0.2s;
  }
  .parallel-toggle.active .toggle-track {
    background: #2a6a9c;
  }
  .toggle-thumb {
    display: block;
    width: 14px;
    height: 14px;
    background: #aaa;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.2s, background 0.2s;
  }
  .parallel-toggle.active .toggle-thumb {
    transform: translateX(14px);
    background: #8ac4ff;
  }
  .time-estimate {
    font-size: 12px;
    color: #666;
    font-family: monospace;
  }
  .parallel-note {
    color: #a8884a;
    font-size: 11px;
    font-style: italic;
    width: 100%;
  }
  .progress-container {
    position: relative;
    height: 24px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
    margin-top: 24px;
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #1a3a5c, #2a6a9c);
    transition: width 0.3s ease;
  }
  .progress-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 11px;
    color: #ccc;
    font-weight: 600;
    /* mix-blend-mode: exclusion; */
  }
</style>
