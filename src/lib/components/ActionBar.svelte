<script>
	import { state as bench } from '$lib/state.svelte.js';

	let copied = $state(false);

	let pct = $derived(
		bench.progressTotal > 0 ? Math.round((bench.progressCurrent / bench.progressTotal) * 100) : 0
	);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(bench.getShareableURL());
			copied = true;
			setTimeout(() => { copied = false; }, 2000);
		} catch { /* noop */ }
	}
</script>

<div class="action-bar">
	<button
		class="run-btn"
		onclick={() => bench.runBenchmark()}
		disabled={bench.running || bench.testCases.length === 0}
	>
		{bench.running ? bench.progress || 'Running...' : '▶ Run Benchmark'}
	</button>

	<button class="copy-btn" onclick={handleCopy}>
		{copied ? '✓ Copied!' : '📋 Copy URL'}
	</button>

	{#if bench.error}
		<div class="error">{bench.error}</div>
	{/if}
</div>

{#if bench.running}
	<div class="progress-container">
		<div class="progress-bar" style="width: {pct}%"></div>
		<span class="progress-label">{pct}%</span>
	</div>
{/if}

<style>
	.action-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.run-btn {
		background: #1a3a5c;
		border: 1px solid #2a5a8c;
		color: #8ac4ff;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		&:hover:not(:disabled) { background: #1e4a6e; }
		&:disabled { opacity: 0.5; cursor: not-allowed; }
	}
	.copy-btn {
		background: #2a2a1a;
		border: 1px solid #4a4a2a;
		color: #c4c48a;
		padding: 10px 16px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 13px;
		&:hover { background: #3a3a2a; }
	}
	.error {
		color: #ff6666;
		font-size: 12px;
		background: #2a1a1a;
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid #4a2a2a;
	}
	.progress-container {
		position: relative;
		height: 22px;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 6px;
		overflow: hidden;
		margin-top: 4px;
	}
	.progress-bar {
		height: 100%;
		background: linear-gradient(90deg, #1a3a5c, #2a6a9c);
		transition: width 0.3s ease;
	}
	.progress-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 11px;
		color: #ccc;
		font-weight: 600;
		mix-blend-mode: difference;
	}
</style>
