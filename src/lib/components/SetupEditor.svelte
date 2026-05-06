<script>
	import CodeEditor from './CodeEditor.svelte';
	import { state as bench } from '$lib/state.svelte.js';
</script>

<div class="setup-editor">
	<div class="header">
		<h3>Setup</h3>
		<span class="hint">Use $N for iteration size</span>
	</div>
	<CodeEditor bind:code={bench.setupCode} />
</div>

<style>
	.setup-editor {
		border: 1px solid #333;
		border-radius: 8px;
		overflow: hidden;
	}
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: #1e1e1e;
		border-bottom: 1px solid #333;
	}
	h3 {
		margin: 0;
		font-size: 14px;
		color: #e0e0e0;
	}
	.hint {
		font-size: 11px;
		color: #888;
		background: #2a2a2a;
		padding: 2px 8px;
		border-radius: 4px;
		font-family: monospace;
	}
</style>
