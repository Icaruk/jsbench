import { DEFAULT_SETUP, DEFAULT_TEST_CASES, DEFAULT_ITERATIONS, DEFAULT_MIN_TIME } from './constants.js';
import { encode, decode } from './serializer.js';

function createInitialState() {
	const hash = typeof location !== 'undefined' ? location.hash.slice(1) : '';
	const decoded = decode(hash);

	return {
		setupCode: decoded?.setupCode ?? DEFAULT_SETUP,
		testCases: decoded?.testCases ?? structuredClone(DEFAULT_TEST_CASES),
		iterations: decoded?.iterations ?? [...DEFAULT_ITERATIONS],
		minTime: decoded?.minTime ?? DEFAULT_MIN_TIME,
		results: null,
		running: false,
		progress: ''
	};
}

class AppState {
	constructor() {
		const initial = createInitialState();
		this.setupCode = $state(initial.setupCode);
		this.testCases = $state(initial.testCases);
		this.iterations = $state(initial.iterations);
		this.minTime = $state(initial.minTime);
		this.results = $state(initial.results);
		this.running = $state(initial.running);
		this.progress = $state(initial.progress);
		this.progressCurrent = $state(0);
		this.progressTotal = $state(0);
		this.error = $state(/** @type {string | null} */ (null));
	}

	syncHash() {
		const data = {
			setupCode: this.setupCode,
			testCases: this.testCases,
			iterations: this.iterations,
			minTime: this.minTime
		};
		const compressed = encode(data);
		location.hash = compressed;
	}

	getShareableURL() {
		const data = {
			setupCode: this.setupCode,
			testCases: this.testCases,
			iterations: this.iterations,
			minTime: this.minTime
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

	removeTestCase(id) {
		this.testCases = this.testCases.filter((tc) => tc.id !== id);
	}

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

		const worker = new Worker(
			new URL('./worker/benchmark.worker.js', import.meta.url),
			{ type: 'module' }
		);

		return new Promise((resolve) => {
			worker.onmessage = (e) => {
				if (e.data.type === 'progress') {
					this.progress = e.data.message;
					this.progressCurrent = e.data.current;
					this.progressTotal = e.data.total;
				} else if (e.data.type === 'result') {
					this.results = e.data.data;
					this.running = false;
					this.progress = '';
					this.progressCurrent = 0;
					this.progressTotal = 0;
					worker.terminate();
					resolve();
				} else if (e.data.type === 'error') {
					this.error = e.data.message;
					this.running = false;
					this.progress = '';
					this.progressCurrent = 0;
					this.progressTotal = 0;
					worker.terminate();
					resolve();
				}
			};

			worker.onerror = (e) => {
				this.error = e.message;
				this.running = false;
				this.progress = '';
				this.progressCurrent = 0;
				this.progressTotal = 0;
				worker.terminate();
				resolve();
			};

			worker.postMessage(JSON.parse(JSON.stringify({
				type: 'run',
				setupCode: this.setupCode,
				testCases: this.testCases.map((tc) => ({ id: tc.id, name: tc.name, code: tc.code })),
				iterations: this.iterations,
				minTime: this.minTime
			})));
		});
	}
}

export const state = new AppState();
