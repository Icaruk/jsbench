<script>
  import CodeEditor from "./CodeEditor.svelte";
  import { state as bench } from "$lib/state.svelte.js";
  import SectionTitle from "./SectionTitle.svelte";
</script>

<SectionTitle title="Setup Code" />

<div class="setup-editor">
  <div class="header">
    <span class="hint">Use $N for iteration size</span>
  </div>
  <CodeEditor bind:code={bench.setupCode} />
</div>

<style>
  .setup-editor {
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
</style>
