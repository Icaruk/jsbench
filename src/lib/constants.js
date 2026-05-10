export const DEFAULT_SETUP = `const obj = {};

for (let i = 0; i < 20; i++) {
  obj[\`key\${i}\`] = i;
}
  
return { obj };`;

export const DEFAULT_TEST_CASES = [
	{
		id: crypto.randomUUID(),
		name: 'spread',
		code: 'const a = { ...obj };'
	},
	{
		id: crypto.randomUUID(),
		name: 'Object.assign',
		code: 'const b = Object.assign({}, obj);'
	},
	{
		id: crypto.randomUUID(),
		name: 'for...in',
		code: `const c = {};
for (const key in obj) {
  c[key] = obj[key];
}`
	}
];

export const DEFAULT_ITERATIONS = [20, 100, 500, 3_000, 20_000];
export const DEFAULT_MIN_TIME = 1000;
export const DEFAULT_WARMUP = 500;
export const DEFAULT_PARALLEL = true;
