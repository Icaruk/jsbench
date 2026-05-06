<script>
	import CodeEditor from './CodeEditor.svelte';

	let { testcase, ondelete, class: className = '' } = $props();
</script>

<div
	class="test-case"
	draggable="true"
	ondragstart={(e) => {
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', testcase.id);
		e.currentTarget.classList.add('dragging');
	}}
	ondragend={(e) => {
		e.currentTarget.classList.remove('dragging');
	}}
	role="listitem"
>
	<div class="test-header">
		<span class="drag-handle" title="Drag to reorder">⠿</span>
		<input
			type="text"
			class="test-name"
			bind:value={testcase.name}
			placeholder="Test name"
		/>
		<button class="delete-btn" onclick={ondelete} title="Delete test">✕</button>
	</div>
	<CodeEditor bind:code={testcase.code} />
</div>

<style>
	.test-case {
		border: 1px solid #333;
		border-radius: 8px;
		overflow: hidden;
		transition: opacity 0.2s;
	}
	.test-case:global(.dragging) {
		opacity: 0.4;
	}
	.test-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: #1e1e1e;
		border-bottom: 1px solid #333;
	}
	.drag-handle {
		cursor: grab;
		color: #666;
		font-size: 16px;
		user-select: none;
		&:active { cursor: grabbing; }
	}
	.test-name {
		flex: 1;
		background: transparent;
		border: none;
		color: #e0e0e0;
		font-size: 13px;
		outline: none;
		font-family: inherit;
	}
	.delete-btn {
		background: transparent;
		border: none;
		color: #666;
		cursor: pointer;
		font-size: 14px;
		padding: 2px 6px;
		border-radius: 4px;
		&:hover { background: #3a1a1a; color: #ff6666; }
	}
</style>
