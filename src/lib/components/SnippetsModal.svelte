<script>
  const snippets = [
    {
      title: "Array of $N integers",
      code: `const arr = Array.from({ length: $N }, (_, i) => i);\nreturn { arr };`
    },
    {
      title: "Set of $N integers",
      code: `const set = new Set(Array.from({ length: $N }, (_, i) => i));\nreturn { set };`
    },
    {
      title: "Map of $N entries",
      code: `const map = new Map(Array.from({ length: $N }, (_, i) => [i, i]));\nreturn { map };`
    },
    {
      title: "Array of $N random numbers",
      code: `const arr = Array.from({ length: $N }, () => Math.random());\nreturn { arr };`
    },
    {
      title: "Array of $N objects",
      code: `const users = Array.from({ length: $N }, (_, i) => ({ id: i, name: \`user-\${i}\` }));\nreturn { users };`
    },
    {
      title: "Object with $N keys",
      code: `const obj = Object.fromEntries(Array.from({ length: $N }, (_, i) => [\`key\${i}\`, i]));\nreturn { obj };`
    }
  ];

  let { onclose } = $props();
  let copiedIndex = $state(-1);

  /** @param {string} code @param {number} index */
  function copySnippet(code, index) {
    navigator.clipboard.writeText(code);
    copiedIndex = index;
    setTimeout(() => { copiedIndex = -1; }, 1500);
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" onclick={onclose}>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <div class="bar bar--between bar--border-bottom modal-header">
      <h2>Snippets</h2>
      <button class="btn--icon" onclick={onclose}>&times;</button>
    </div>
    <div class="snippets-list">
      {#each snippets as snippet, i (snippet.title)}
        <div class="snippet">
          <div class="snippet-title">{snippet.title}</div>
          <div class="code-block">
            <pre class="snippet-code">{snippet.code}</pre>
            <button
              class="btn--accent-sm copy-btn"
              onclick={() => copySnippet(snippet.code, i)}
            >
              {copiedIndex === i ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }
  .modal-header {
    padding: var(--space-3) var(--space-4);
  }
  h2 {
    margin: 0;
    font-size: var(--font-lg);
    color: var(--color-text);
  }
  .snippets-list {
    padding: var(--space-3) var(--space-4);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .snippet {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .snippet-title {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-text);
  }
  .snippet-code {
    margin: 0;
    padding: var(--space-2) var(--space-3);
    padding-right: 70px;
    font-family: var(--font-mono);
    font-size: var(--font-xs);
    color: var(--color-text);
    white-space: pre;
    overflow-x: auto;
  }
  .copy-btn {
    position: absolute;
    top: var(--space-1);
    right: var(--space-1);
  }
</style>
