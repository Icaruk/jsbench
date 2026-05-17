<script>
  import CodeEditor from "./CodeEditor.svelte";
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";
  import SnippetsModal from "./SnippetsModal.svelte";

  let previewCode = $state('');
  let showSnippets = $state(false);

  async function handlePreview() {
    await bench.runPreview();
    if (bench.previewResult) previewCode = bench.previewResult;
  }
</script>

<SectionTitle title="Setup Code" />

<div class="card">
  <div class="bar bar--between bar--border-bottom">
    <span class="hint">Use $N for iteration size</span>
    <button class="btn--success-ghost-sm" onclick={() => showSnippets = true}>Snippets</button>
  </div>
  <CodeEditor bind:code={bench.setupCode} />
  <div class="bar bar--between bar--border-top">
    <span class="text-muted-mono">Preview always uses N=1</span>
    <button
      class="btn--accent"
      data-testid="preview-btn"
      onclick={handlePreview}
      disabled={bench.previewRunning}
    >
      {bench.previewRunning ? "Running..." : "Preview variables"}
    </button>
  </div>
  {#if bench.previewError}
    <div class="error-block">{bench.previewError}</div>
  {/if}
  {#if previewCode}
    <div class="preview-editor">
      <CodeEditor code={previewCode} readonly={true} />
    </div>
  {/if}
  {#if showSnippets}
    <SnippetsModal onclose={() => showSnippets = false} />
  {/if}
</div>

<style>
  .hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    background: var(--color-surface);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
  }
  .preview-editor :global(.cm-scroller) {
    max-height: 200px;
  }
</style>
