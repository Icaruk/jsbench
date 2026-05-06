export const DEFAULT_SETUP = `return {
  itemList: Array.from({ length: $N }, (_, i) => i)
};`;

export const DEFAULT_TEST_CASES = [
	{
		id: crypto.randomUUID(),
		name: 'forEach',
		code: 'itemList.forEach(_x => _x);'
	},
	{
		id: crypto.randomUUID(),
		name: 'for...of',
		code: 'for (const _item of itemList) {}'
	},
	{
		id: crypto.randomUUID(),
		name: 'for i',
		code: 'for (let i = 0; i < itemList.length; i++) {}'
	}
];

export const DEFAULT_ITERATIONS = [10, 100, 500, 2000];
export const DEFAULT_MIN_TIME = 1000;
