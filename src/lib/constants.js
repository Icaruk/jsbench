/** @typedef {{ id: string; name: string; code: string; }} TestCase */

/** @typedef {{ label: string; type: string; detail?: string; }} Completion */

/** @typedef {{ iterationSize: number; results: IterationResult[]; }} IterationGroup */

/** @typedef {{ testCaseId: string; name: string; opsPerSec: number; }} IterationResult */

/** @typedef {{ type: 'preview'; setupCode: string; } | { type: 'run'; setupCode: string; testCases: TestCase[]; iterations: number[]; minTime: number; warmup: number; }} WorkerPayload */

/** @typedef {{ type: 'preview-result'; data: object; } | { type: 'preview-error'; message: string; } | { type: 'progress'; message: string; current: number; total: number; } | { type: 'result'; data: IterationGroup[]; } | { type: 'error'; message: string; }} WorkerMessage */

export const DEFAULT_SETUP = `const arr = Array.from({ length: $N }, (_, i) => i);
return { arr };`;

/** @type {TestCase[]} */
export const DEFAULT_TEST_CASES = [
	{
		id: crypto.randomUUID(),
		name: 'new Set',
		code: 'const a = [...new Set(arr)];'
	},
	{
		id: crypto.randomUUID(),
		name: 'filter + indexOf',
		code: 'const b = arr.filter((v, i) => arr.indexOf(v) === i);'
	},
	{
		id: crypto.randomUUID(),
		name: 'reduce + includes',
		code: 'const c = arr.reduce((a, v) => a.includes(v) ? a : [...a, v], []);'
	}
];

export const DEFAULT_TITLE = "Remove duplicates from array — Set vs filter vs reduce";
/** @type {number[]} */
export const DEFAULT_ITERATIONS = [20, 100, 500, 3_000, 20_000];
export const DEFAULT_MIN_TIME = 1000;
export const DEFAULT_WARMUP = 500;
export const DEFAULT_PARALLEL = true;
