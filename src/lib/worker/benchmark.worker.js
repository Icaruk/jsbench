/** @type {number} */
let warmupFactor = 0.1;

	self.onmessage = function (e) {
	if (e.data.type !== 'run') return;

	const { setupCode, testCases, iterations, minTime } = e.data;
	const totalSteps = iterations.length * testCases.length;
	let currentStep = 0;
	const allResults = [];

	for (const n of iterations) {
		const resolvedSetup = setupCode.replace(/\$N/g, String(n));
		let context;
		try {
			context = new Function(resolvedSetup)();
		} catch (err) {
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
		const iterationResults = [];

		for (let ti = 0; ti < testCases.length; ti++) {
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
			} catch (err) {
				self.postMessage({
					type: 'error',
					message: `Compile error in "${tc.name}": ${err.message}`
				});
				return;
			}

			const warmupCount = Math.max(1, Math.floor(n * warmupFactor));
			try {
				for (let i = 0; i < warmupCount; i++) fn(...values);
			} catch (err) {
				self.postMessage({
					type: 'error',
					message: `Runtime error in "${tc.name}" (warmup): ${err.message}`
				});
				return;
			}

			let ops = 0;
			const start = performance.now();
			try {
				while (performance.now() - start < minTime) {
					fn(...values);
					ops++;
				}
			} catch (err) {
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
