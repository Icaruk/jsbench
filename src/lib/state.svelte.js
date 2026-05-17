/** @import { TestCase, Completion, WorkerMessage, IterationGroup } from './constants.js' */
import { DEFAULT_SETUP, DEFAULT_TEST_CASES, DEFAULT_ITERATIONS, DEFAULT_MIN_TIME, DEFAULT_WARMUP, DEFAULT_PARALLEL, DEFAULT_TITLE } from './constants.js';
import { encode, decode } from './serializer.js';

/** @param {number} testCaseCount */
function getWorkerCount(testCaseCount) {
	const cores = navigator.hardwareConcurrency || 4;
	return Math.min(testCaseCount, cores);
}

/** @param {TestCase[]} testCases @param {number} numWorkers @returns {TestCase[][]} */
function distributeTestCases(testCases, numWorkers) {
	/** @type {TestCase[][]} */
	const chunks = Array.from({ length: numWorkers }, () => []);
	testCases.forEach((tc, i) => chunks[i % numWorkers].push(tc));
	return chunks;
}

/** @param {{ iterations: number[]; testCases: TestCase[]; minTime: number; warmup: number; parallel: boolean; }} opts @returns {number} */
function estimateTimeSec({ iterations, testCases, minTime, warmup, parallel }) {
	const totalPerBench = (warmup + minTime) / 1000;
	if (!parallel) {
		return iterations.length * testCases.length * totalPerBench;
	}
	const numWorkers = getWorkerCount(testCases.length);
	const batchesPerIteration = Math.ceil(testCases.length / numWorkers);
	return iterations.length * batchesPerIteration * totalPerBench;
}

function createInitialState() {
	const hash = typeof location !== 'undefined' ? location.hash.slice(1) : '';
	const decoded = decode(hash);

	return {
		setupCode: decoded?.setupCode ?? DEFAULT_SETUP,
		testCases: /** @type {TestCase[]} */ (decoded?.testCases ?? structuredClone(DEFAULT_TEST_CASES)),
		iterations: decoded?.iterations ?? [...DEFAULT_ITERATIONS],
		minTime: decoded?.minTime ?? DEFAULT_MIN_TIME,
		parallel: decoded?.parallel ?? DEFAULT_PARALLEL,
		title: decoded?.title ?? DEFAULT_TITLE,
		results: /** @type {IterationGroup[] | null} */ (null),
		running: false,
		progress: ''
	};
}

/** @param {any} value @returns {string} */
function formatPreview(value) {
	return JSON.stringify(value, null, 2);
}

/** @param {Record<string, any>} obj @returns {Completion[]} */
function extractCompletions(obj) {
	if (!obj || typeof obj !== 'object') return [];
	/** @type {Completion[]} */
	const completions = [];
	const METHODS_TO_SKIP = new Set([
		'constructor', '__proto__', '__defineGetter__', '__defineSetter__',
		'__lookupGetter__', '__lookupSetter__', 'toLocaleString', 'toString', 'valueOf',
		'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'
	]);

	for (const [key, value] of Object.entries(obj)) {
		completions.push({ label: key, type: 'variable', detail: typeof value });

		if (value !== null && typeof value === 'object') {
			const proto = Object.getPrototypeOf(value);
			if (proto) {
				const methods = Object.getOwnPropertyNames(proto)
					.filter(m => !METHODS_TO_SKIP.has(m) && typeof proto[m] === 'function');
				for (const method of methods) {
					completions.push({ label: `${key}.${method}`, type: 'method' });
				}
			}
			if (Array.isArray(value)) {
				completions.push({ label: `${key}.length`, type: 'property', detail: 'number' });
			} else {
				for (const subKey of Object.keys(value)) {
					completions.push({ label: `${key}.${subKey}`, type: 'property' });
				}
			}
		} else if (typeof value === 'string') {
			completions.push({ label: `${key}.length`, type: 'property', detail: 'number' });
		}
	}
	return completions;
}

class AppState {
	constructor() {
		const initial = createInitialState();
		this.setupCode = $state(initial.setupCode);
		/** @type {TestCase[]} */
		this.testCases = $state(initial.testCases);
		/** @type {number[]} */
		this.iterations = $state(initial.iterations);
		this.minTime = $state(initial.minTime);
		this.parallel = $state(initial.parallel);
		this.title = $state(initial.title);
		/** @type {IterationGroup[] | null} */
		this.results = $state(initial.results);
		this.running = $state(initial.running);
		this.progress = $state(initial.progress);
		this.progressCurrent = $state(0);
		this.progressTotal = $state(0);
		/** @type {string | null} */
		this.error = $state(null);
		/** @type {string | null} */
		this.previewResult = $state(null);
		/** @type {string | null} */
		this.previewError = $state(null);
		this.previewRunning = $state(false);
		/** @type {Completion[]} */
		this.completions = $state([]);
	}

	syncHash() {
		const data = {
			setupCode: this.setupCode,
			testCases: this.testCases,
			iterations: this.iterations,
			minTime: this.minTime,
			parallel: this.parallel,
			title: this.title
		};
		const compressed = encode(data);
		location.hash = compressed;
	}

	getShareableURL() {
		const data = {
			setupCode: this.setupCode,
			testCases: this.testCases,
			iterations: this.iterations,
			minTime: this.minTime,
			parallel: this.parallel,
			title: this.title
		};
		const compressed = encode(data);
		return `${location.origin}${location.pathname}#${compressed}`;
	}

	addTestCase() {
		this.testCases.push({
			id: crypto.randomUUID(),
			name: `Test ${this.testCases.length + 1}`,
			code: ''
		});
	}

	/** @param {string} id */
	removeTestCase(id) {
		this.testCases = this.testCases.filter((tc) => tc.id !== id);
	}

	/** @param {number} fromIndex @param {number} toIndex */
	moveTestCase(fromIndex, toIndex) {
		if (fromIndex === toIndex) return;
		const item = this.testCases.splice(fromIndex, 1)[0];
		this.testCases.splice(toIndex, 0, item);
	}

	async runBenchmark() {
		if (this.running) return;
		this.running = true;
		this.error = null;
		this.results = null;
		this.progress = 'Initializing...';
		this.progressCurrent = 0;
		this.progressTotal = this.iterations.length * this.testCases.length;

		if (this.parallel) {
			return this._runParallel();
		}
		return this._runSequential();
	}

	async runPreview() {
		if (this.previewRunning) return;
		this.previewRunning = true;
		this.previewError = null;
		this.previewResult = null;

		const worker = this._createWorker({
			type: 'preview',
			setupCode: this.setupCode
		});

		const timeout = setTimeout(() => {
			worker.terminate();
			this.previewError = 'Preview timeout (2s)';
			this.previewRunning = false;
		}, 2000);

		/** @type {Promise<void>} */
		const promise = new Promise((resolve) => {
			/** @param {MessageEvent<WorkerMessage>} e */
			worker.onmessage = (e) => {
				if (e.data.type === 'preview-result') {
					clearTimeout(timeout);
					this.previewResult = formatPreview(e.data.data);
					this.completions = extractCompletions(e.data.data);
					this.previewRunning = false;
					worker.terminate();
					resolve(undefined);
				} else if (e.data.type === 'preview-error') {
					clearTimeout(timeout);
					this.previewError = e.data.message;
					this.previewRunning = false;
					worker.terminate();
					resolve(undefined);
				}
			};

			worker.onerror = (e) => {
				clearTimeout(timeout);
				this.previewError = e.message;
				this.previewRunning = false;
				worker.terminate();
				resolve(undefined);
			};
		});
		return promise;
	}

	/** @param {import('./constants.js').WorkerPayload} payload */
	_createWorker(payload) {
		const worker = new Worker(
			new URL('./worker/benchmark.worker.js', import.meta.url),
			{ type: 'module' }
		);
		worker.postMessage(JSON.parse(JSON.stringify(payload)));
		return worker;
	}

	_runSequential() {
		const worker = this._createWorker({
			type: 'run',
			setupCode: this.setupCode,
			testCases: this.testCases.map((tc) => ({ id: tc.id, name: tc.name, code: tc.code })),
			iterations: this.iterations,
			minTime: this.minTime,
			warmup: DEFAULT_WARMUP
		});

		/** @type {Promise<void>} */
		return new Promise((resolve) => {
			/** @param {MessageEvent<WorkerMessage>} e */
			worker.onmessage = (e) => {
				if (e.data.type === 'progress') {
					this.progress = e.data.message;
					this.progressCurrent = e.data.current;
					this.progressTotal = e.data.total;
				} else if (e.data.type === 'result') {
					this.results = e.data.data;
					this._finishRun();
					worker.terminate();
					resolve(undefined);
				} else if (e.data.type === 'error') {
					this.error = e.data.message;
					this._finishRun();
					worker.terminate();
					resolve(undefined);
				}
			};

			worker.onerror = (e) => {
				this.error = e.message;
				this._finishRun();
				worker.terminate();
				resolve(undefined);
			};
		});
	}

	_runParallel() {
		const numWorkers = getWorkerCount(this.testCases.length);
		const chunks = distributeTestCases(this.testCases, numWorkers);
		const totalSteps = this.iterations.length * this.testCases.length;
		let completedSteps = 0;
		let pending = chunks.length;
		/** @type {IterationGroup[]} */
		const allResults = [];
		const iterationOrder = this.iterations;
		/** @type {string | null} */
		let firstError = null;

		/** @type {Promise<void>} */
		return new Promise((resolve) => {
			for (let wi = 0; wi < chunks.length; wi++) {
				const chunk = chunks[wi];
				if (chunk.length === 0) {
					pending--;
					if (pending === 0) {
						this._mergeParallelResults(allResults, iterationOrder);
						this._finishRun();
						resolve(undefined);
					}
					continue;
				}

				const worker = this._createWorker({
					type: 'run',
					setupCode: this.setupCode,
					testCases: chunk.map((tc) => ({ id: tc.id, name: tc.name, code: tc.code })),
					iterations: this.iterations,
					minTime: this.minTime,
					warmup: DEFAULT_WARMUP
				});

				worker.onmessage = /** @param {MessageEvent<WorkerMessage>} e */ (e) => {
					if (e.data.type === 'progress') {
						completedSteps++;
						const pct = Math.round((completedSteps / totalSteps) * 100);
						this.progress = `${pct}% — parallel (${numWorkers} workers)`;
						this.progressCurrent = completedSteps;
						this.progressTotal = totalSteps;
					} else if (e.data.type === 'result') {
						allResults.push(...e.data.data);
						pending--;
						worker.terminate();
						if (pending === 0) {
							if (firstError) {
								this.error = firstError;
							} else {
								this._mergeParallelResults(allResults, iterationOrder);
							}
							this._finishRun();
							resolve(undefined);
						}
					} else if (e.data.type === 'error') {
						if (!firstError) firstError = e.data.message;
						pending--;
						worker.terminate();
						if (pending === 0) {
							this.error = firstError;
							this._finishRun();
							resolve(undefined);
						}
					}
				};

				worker.onerror = (e) => {
					if (!firstError) firstError = e.message;
					pending--;
					worker.terminate();
					if (pending === 0) {
						this.error = firstError;
						this._finishRun();
						resolve(undefined);
					}
				};
			}
		});
	}

	/** @param {IterationGroup[]} rawResults @param {number[]} iterationOrder */
	_mergeParallelResults(rawResults, iterationOrder) {
		/** @type {Map<number, import('./constants.js').IterationResult[]>} */
		const grouped = new Map();
		for (const group of rawResults) {
			if (!grouped.has(group.iterationSize)) {
				grouped.set(group.iterationSize, []);
			}
			grouped.get(group.iterationSize)?.push(...group.results);
		}

		this.results = iterationOrder.map((n) => ({
			iterationSize: n,
			results: grouped.get(n) || []
		}));
	}

	_finishRun() {
		this.running = false;
		this.progress = '';
		this.progressCurrent = 0;
		this.progressTotal = 0;
	}

	getEstimatedTime() {
		return estimateTimeSec({
			iterations: this.iterations,
			testCases: this.testCases,
			minTime: this.minTime,
			warmup: DEFAULT_WARMUP,
			parallel: this.parallel
		});
	}
}

export const state = new AppState();
