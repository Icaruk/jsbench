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
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: opacity 0.2s;
	}
	.test-case:global(.dragging) {
		opacity: 0.4;
	}
	.test-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface-raised);
		border-bottom: 1px solid var(--color-border);
	}
	.drag-handle {
		cursor: grab;
		color: var(--color-text-dim);
		font-size: var(--font-lg);
		user-select: none;
		&:hover { color: var(--color-text); }
		&:active { cursor: grabbing; }
	}
	.test-name {
		flex: 1;
		background: transparent;
		border: none;
		color: var(--color-text);
		font-size: var(--font-md);
		outline: none;
		font-family: inherit;
	}
	.delete-btn {
		background: transparent;
		border: none;
		color: var(--color-text-dim);
		cursor: pointer;
		font-size: var(--font-sm);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		&:hover { background: var(--color-error-bg); color: var(--color-error); }
	}
</style>
