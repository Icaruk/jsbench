<script>
  import CodeEditor from "./CodeEditor.svelte";
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";

  let previewCode = $state('');

  async function handlePreview() {
    await bench.runPreview();
    if (bench.previewResult) previewCode = bench.previewResult;
  }
</script>

<SectionTitle title="Setup Code" />

<div class="section-content">
  <div class="header">
    <span class="hint">Use $N for iteration size</span>
  </div>
  <CodeEditor bind:code={bench.setupCode} />
  <div class="preview-section">
    <span class="preview-hint">Preview always uses N=1</span>
    <button
      class="preview-btn"
      onclick={handlePreview}
      disabled={bench.previewRunning}
    >
      {bench.previewRunning ? "Running..." : "Preview variables"}
    </button>
  </div>
  {#if bench.previewError}
    <div class="preview-error">{bench.previewError}</div>
  {/if}
  {#if previewCode}
    <div class="preview-editor">
      <CodeEditor code={previewCode} readonly={true} />
    </div>
  {/if}
</div>

<style>
  .section-content {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-raised);
    border-bottom: 1px solid var(--color-border);
  }
  h3 {
    margin: 0;
    font-size: var(--font-sm);
    color: var(--color-text);
  }
  .hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
  }
  .preview-section {
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface-raised);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }
  .preview-hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }
  .preview-btn {
    background: var(--color-accent-bg);
    border: 1px solid var(--color-accent-border);
    color: var(--color-accent);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-sm);
    font-weight: 600;
    font-family: var(--font-mono);
    transition: background 0.2s;
  }
  .preview-btn:hover:not(:disabled) {
    background: var(--color-accent-hover);
  }
  .preview-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .preview-error {
    padding: var(--space-3);
    background: var(--color-error-bg);
    color: var(--color-error);
    border-top: 1px solid var(--color-error-border);
    font-family: var(--font-mono);
    font-size: var(--font-sm);
  }
  .preview-editor :global(.cm-scroller) {
    max-height: 200px;
  }
</style>
