/** @import { WorkerPayload, IterationGroup, TestCase } from '../constants.js' */

/** @param {{ data: WorkerPayload }} e */
self.onmessage = function (e) {
	const type = e.data.type;
	if (type === 'preview') {
		const { setupCode } = e.data;
		const resolvedSetup = setupCode.replace(/\$N/g, '1');
		try {
			const result = new Function(resolvedSetup)();
			self.postMessage({ type: 'preview-result', data: result });
		} catch (/** @type {any} */ err) {
			self.postMessage({ type: 'preview-error', message: err.message });
		}
		return;
	}

	if (type !== 'run') return;

	const { setupCode, testCases, iterations, minTime, warmup } = e.data;
	const totalSteps = iterations.length * testCases.length;
	let currentStep = 0;
	/** @type {IterationGroup[]} */
	const allResults = [];

	for (const n of iterations) {
		const resolvedSetup = setupCode.replace(/\$N/g, String(n));
		let context;
		try {
			context = new Function(resolvedSetup)();
		} catch (/** @type {any} */ err) {
			self.postMessage({
				type: 'error',
				message: `Setup error (N=${n}): ${err.message}`
			});
			return;
		}

		if (typeof context !== 'object' || context === null) {
			self.postMessage({
				type: 'error',
				message: `Setup must return an object, got ${typeof context} (N=${n})`
			});
			return;
		}

		const keys = Object.keys(context);
		const values = Object.values(context);
		/** @type {import('../constants.js').IterationResult[]} */
		const iterationResults = [];

		for (let ti = 0; ti < testCases.length; ti++) {
			/** @type {TestCase} */
			const tc = testCases[ti];
			self.postMessage({
				type: 'progress',
				message: `N=${n} — ${tc.name} (${ti + 1}/${testCases.length})`,
				current: ++currentStep,
				total: totalSteps
			});

			let fn;
			try {
				fn = new Function(...keys, tc.code);
			} catch (/** @type {any} */ err) {
				self.postMessage({
					type: 'error',
					message: `Compile error in "${tc.name}": ${err.message}`
				});
				return;
			}

			let warmupOps = 0;
			const warmupStart = performance.now();
			try {
				while (performance.now() - warmupStart < warmup) {
					fn(...values);
					warmupOps++;
				}
			} catch (/** @type {any} */ err) {
				self.postMessage({
					type: 'error',
					message: `Runtime error in "${tc.name}" (warmup): ${err.message}`
				});
				return;
			}

			const avgExecTime = (performance.now() - warmupStart) / warmupOps;
			const checkAfter = Math.max(1, Math.ceil(minTime / avgExecTime / 100));

			let ops = 0;
			const start = performance.now();
			let checksLeft = checkAfter;
			try {
				while (true) {
					fn(...values);
					ops++;
					checksLeft--;
					if (!checksLeft) {
						if (performance.now() - start >= minTime) break;
						checksLeft = checkAfter;
					}
				}
			} catch (/** @type {any} */ err) {
				self.postMessage({
					type: 'error',
					message: `Runtime error in "${tc.name}": ${err.message}`
				});
				return;
			}
			const elapsed = performance.now() - start;
			const opsPerSec = (ops / elapsed) * 1000;

			iterationResults.push({
				testCaseId: tc.id,
				name: tc.name,
				opsPerSec
			});
		}

		allResults.push({
			iterationSize: n,
			results: iterationResults
		});
	}

	self.postMessage({ type: 'result', data: allResults });
};
