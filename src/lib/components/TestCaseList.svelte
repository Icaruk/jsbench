<script>
	import TestCase from './TestCase.svelte';
	import { state as bench } from '$lib/state.svelte.js';

	let dropTargetId = $state(null);

	function handleDragOver(e, index) {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(e, targetIndex) {
		e.preventDefault();
		dropTargetId = null;
		const draggedId = e.dataTransfer.getData('text/plain');
		if (!draggedId) return;
		const fromIndex = bench.testCases.findIndex((tc) => tc.id === draggedId);
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

<div class="test-list" role="list">
	<h3>Test Cases</h3>
	{#each bench.testCases as testcase, index (testcase.id)}
		<div
			class="test-wrapper"
			role="listitem"
			class:drop-active={dropTargetId === testcase.id}
			ondragover={(e) => handleDragOver(e, index)}
			ondrop={(e) => handleDrop(e, index)}
			ondragenter={() => handleDragEnter(testcase.id)}
			ondragleave={(e) => handleDragLeave(e, testcase.id)}
		>
			<TestCase
				{testcase}
				ondelete={() => bench.removeTestCase(testcase.id)}
			/>
		</div>
	{/each}
	<button class="add-btn" onclick={() => bench.addTestCase()}>
		+ Add Test Case
	</button>
</div>

<style>
	.test-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h3 {
		margin: 0 0 4px 0;
		font-size: 14px;
		color: #e0e0e0;
	}
	.test-wrapper {
		transition: transform 0.15s;
	}
	.test-wrapper.drop-active {
		transform: translateY(4px);
	}
	.add-btn {
		background: #1a2a1a;
		border: 1px dashed #3a5a3a;
		color: #6a9a6a;
		padding: 10px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		&:hover { background: #1e3a1e; border-color: #4a7a4a; }
	}
</style>
