<script>
  import TestCase from "./TestCase.svelte";
  import SectionTitle from "./SectionTitle.svelte";
  import { state as bench } from "$lib/state.svelte.js";

  /** @type {string | null} */
  let dropTargetId = $state(null);

  /** @param {DragEvent} e @param {number} index */
  function handleDragOver(e, index) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }

  /** @param {DragEvent} e @param {number} targetIndex */
  function handleDrop(e, targetIndex) {
    e.preventDefault();
    dropTargetId = null;
    const draggedId = e.dataTransfer?.getData("text/plain");
    if (!draggedId) return;
    const fromIndex = bench.testCases.findIndex(/** @param {import('$lib/constants.js').TestCase} tc */ tc => tc.id === draggedId);
    if (fromIndex === -1 || fromIndex === targetIndex) return;
    bench.moveTestCase(fromIndex, targetIndex);
  }

  /** @param {string} id */
  function handleDragEnter(id) {
    dropTargetId = id;
  }

  /** @param {DragEvent} e @param {string} id */
  function handleDragLeave(e, id) {
    if (!(/** @type {Element} */ (e.currentTarget)).contains(/** @type {Node} */ (e.relatedTarget))) {
      if (dropTargetId === id) dropTargetId = null;
    }
  }
</script>

<SectionTitle title="Test Cases" />

<div
  class="section-content"
  role="list"
>
  {#each bench.testCases as testcase, index (testcase.id)}
    <div
      class="test-wrapper"
      role="listitem"
      class:drop-active={dropTargetId === testcase.id}
      ondragover={e => handleDragOver(e, index)}
      ondrop={e => handleDrop(e, index)}
      ondragenter={() => handleDragEnter(testcase.id)}
      ondragleave={e => handleDragLeave(e, testcase.id)}
    >
      <TestCase
        {testcase}
        ondelete={() => bench.removeTestCase(testcase.id)}
      />
    </div>
  {/each}
  <button
    class="btn--success-ghost"
    onclick={() => bench.addTestCase()}
  >
    + Add Test Case
  </button>
</div>

<style>
  .section-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .test-wrapper {
    transition: transform 0.15s;
  }
  .test-wrapper.drop-active {
    transform: translateY(var(--space-1));
  }
</style>
