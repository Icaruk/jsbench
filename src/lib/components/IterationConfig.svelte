<script>
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";

  const MIN_TIME = 100;
  const MAX_TIME = 30_000;

  let iterationsStr = $state(bench.iterations.join(", "));
  let minTimeStr = $state(String(bench.minTime));

  /** @param {string} str @returns {number[]} */
  function parseIterations(str) {
    return str
      .split(",")
      .map(/** @param {string} s */ s => parseInt(s.trim().replace(/_/g, ""), 10))
      .filter(/** @param {number} n */ n => !isNaN(n) && n > 0);
  }

  /** @param {number} n @returns {string} */
  function formatWithUnderscores(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_");
  }

  /** @param {number[]} arr @returns {string} */
  function formatIterations(arr) {
    return arr.map(n => formatWithUnderscores(n)).join(", ");
  }

  function handleIterationsBlur() {
    const parsed = parseIterations(iterationsStr);
    if (parsed.length > 0) {
      bench.iterations = parsed;
    }
    iterationsStr = formatIterations(bench.iterations);
  }

  /** @param {string} raw @returns {number | null} */
  function clampMinTime(raw) {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return null;
    return Math.max(MIN_TIME, Math.min(parsed, MAX_TIME));
  }

  function handleMinTimeBlur() {
    const clamped = clampMinTime(minTimeStr);
    if (clamped === null) {
      minTimeStr = String(bench.minTime);
      return;
    }
    bench.minTime = clamped;
    minTimeStr = String(clamped);
  }
</script>

<SectionTitle title="Configuration" />

<div class="section-content">
  <div class="row">
    <label class="field">
      <div class="label-row">
        <span class="label-text">Title</span>
        <span class="text-muted-mono">{bench.title.length}/64</span>
      </div>
      <input
        type="text"
        class="input"
        maxlength={64}
        bind:value={bench.title}
        placeholder="Remove duplicates from array"
      />
    </label>
  </div>
  <div class="row">
    <label class="field">
      <span class="label-text">Iteration sizes ($N)</span>
      <span class="text-muted-mono">Values in milliseconds can be separated by comma</span>
      <input
        type="text"
        class="input"
        bind:value={iterationsStr}
        onblur={handleIterationsBlur}
        placeholder="10, 100, 500, 2_000, 10_000"
      />
    </label>
    <label class="field">
      <span class="label-text">Min run time (ms)</span>
      <span class="text-muted-mono">Minimum time each test case will run per iteration</span>
      <input
        type="text"
        class="input"
        bind:value={minTimeStr}
        onblur={handleMinTimeBlur}
        placeholder="1000"
      />
    </label>
  </div>
</div>

<p class="info-text">Each size replaces <code>$N</code> in your setup code and runs all test cases independently. Compare how approaches scale with different input sizes.</p>

<style>
  .section-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .row {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 180px;
  }
  .label-text {
    font-size: var(--font-sm);
    color: var(--color-text);
  }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .info-text {
    margin: var(--space-2) 0 0;
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
    line-height: var(--lh-md);
  }
  .info-text code {
    color: var(--color-accent);
    background: var(--color-surface);
    padding: 1px var(--space-1);
    border-radius: var(--radius-sm);
  }
</style>
