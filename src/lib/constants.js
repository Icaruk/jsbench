export const DEFAULT_SETUP = `const arr = Array.from({ length: $N }, (_, i) => i);
return { arr };`;

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
export const DEFAULT_ITERATIONS = [20, 100, 500, 3_000, 20_000];
export const DEFAULT_MIN_TIME = 1000;
export const DEFAULT_WARMUP = 500;
export const DEFAULT_PARALLEL = true;
