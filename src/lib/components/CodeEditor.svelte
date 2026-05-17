<script>
	/** @import { Completion } from '../constants.js' */
	import { EditorView, basicSetup } from 'codemirror';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { autocompletion } from '@codemirror/autocomplete';
	import { onMount } from 'svelte';

	/** @type {{ code?: string; onchange?: (val: string) => void; placeholder?: string; readonly?: boolean; completions?: Completion[] }} */
	let { code = $bindable(''), onchange, placeholder = '', readonly = false, completions = [] } = $props();

	/** @type {HTMLElement} */
	let editorEl;
	/** @type {EditorView | undefined} */
	let view;
	let currentCompletions = $derived(completions);

	/** @param {import('@codemirror/autocomplete').CompletionContext} context */
	function completionSource(context) {
		const word = context.matchBefore(/[\w.]+/);
		if (!word) return null;
		const text = word.text;
		const options = currentCompletions
			.filter(c => c.label.startsWith(text))
			.map(c => ({ label: c.label, type: c.type, detail: c.detail }));
		if (options.length === 0) return null;
		return { from: word.from, options };
	}

	onMount(() => {
		view = new EditorView({
			doc: code,
			extensions: [
				basicSetup,
				javascript(),
				oneDark,
				autocompletion({ override: [completionSource] }),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const val = update.state.doc.toString();
						code = val;
						onchange?.(val);
					}
				}),
				EditorView.editable.of(!readonly)
			],
			parent: editorEl
		});

		return () => view?.destroy();
	});

	$effect(() => {
		if (!view) return;
		const current = view.state.doc.toString();
		if (code !== current) {
			view.dispatch({
				changes: { from: 0, to: current.length, insert: code }
			});
		}
	});
</script>

<div class="cm-wrapper" bind:this={editorEl}></div>

<style>
	.cm-wrapper {
		border-radius: var(--radius-md);
		overflow: hidden;
	}
	.cm-wrapper :global(.cm-editor) {
		font-size: var(--font-md);
		height: auto;
	}
	.cm-wrapper :global(.cm-scroller) {
		overflow: auto;
		max-height: 300px;
	}
</style>
