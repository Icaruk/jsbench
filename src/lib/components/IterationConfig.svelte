<script>
  import { state as bench } from "$lib/state.svelte.js";

  let iterationsStr = $state(bench.iterations.join(", "));
  let minTimeStr = $state(String(bench.minTime));

  function handleIterationsBlur() {
    const parsed = iterationsStr
      .split(",")
      .map(s => parseInt(s.trim().replace(/_/g, ""), 10))
      .filter(n => !isNaN(n) && n > 0);
    if (parsed.length > 0) {
      bench.iterations = parsed;
    }
  }

  function handleMinTimeBlur() {
    let parsed = parseInt(minTimeStr, 10);

    if (!isNaN(parsed) && parsed > 0) {
      parsed = Math.min(parsed, 10_000);

      bench.minTime = parsed;
      minTimeStr = String(parsed);
    }
  }
</script>

<div class="config">
  <label class="field">
    <span>Iteration sizes ($N)</span>
    <input
      type="text"
      bind:value={iterationsStr}
      onblur={handleIterationsBlur}
      placeholder="10, 100, 500, 2_000, 10_000"
    />
  </label>
  <label class="field">
    <span>Min time (ms)</span>
    <input
      type="text"
      bind:value={minTimeStr}
      onblur={handleMinTimeBlur}
      placeholder="1000"
    />
  </label>
</div>

<style>
  .config {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #aaa;
    flex: 1;
    min-width: 180px;
  }
  .field input {
    background: #1e1e1e;
    border: 1px solid #333;
    color: #e0e0e0;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 13px;
    outline: none;
    &:focus {
      border-color: #555;
    }
  }
</style>
