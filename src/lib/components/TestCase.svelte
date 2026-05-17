<script>
	import CodeEditor from './CodeEditor.svelte';
	import { state as bench } from '$lib/state.svelte.js';

	let { testcase, ondelete, class: className = '' } = $props();
</script>

<div
	class="card"
	draggable="true"
	ondragstart={(e) => {
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', testcase.id);
		}
		e.currentTarget.classList.add('dragging');
	}}
	ondragend={(e) => {
		e.currentTarget.classList.remove('dragging');
	}}
	role="listitem"
>
	<div class="bar bar--border-bottom">
		<span class="drag-handle" title="Drag to reorder">⠿</span>
		<input
			type="text"
			class="test-name"
			bind:value={testcase.name}
			placeholder="Test name"
		/>
		<button class="btn--delete" onclick={ondelete} title="Delete test">✕</button>
	</div>
	<CodeEditor bind:code={testcase.code} completions={bench.completions} />
</div>

<style>
	:global(.dragging) {
		opacity: 0.4;
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
</style>
