<script>
  import TestCase from "./TestCase.svelte";
  import SectionTitle from "./SectionTitle.svelte";
  import { state as bench } from "$lib/state.svelte.js";

  let dropTargetId = $state(null);

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, targetIndex) {
    e.preventDefault();
    dropTargetId = null;
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId) return;
    const fromIndex = bench.testCases.findIndex(tc => tc.id === draggedId);
    if (fromIndex === -1 || fromIndex === targetIndex) return;
    bench.moveTestCase(fromIndex, targetIndex);
  }

  function handleDragEnter(id) {
    dropTargetId = id;
  }

  function handleDragLeave(e, id) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
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
    class="add-btn"
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
  .add-btn {
    background: rgba(106, 154, 106, 0.1);
    border: 1px dashed rgba(106, 154, 106, 0.3);
    color: var(--color-success);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-md);
    &:hover {
      background: rgba(106, 154, 106, 0.18);
      border-color: rgba(106, 154, 106, 0.5);
    }
  }
</style>
