import LZString from 'lz-string';

export function encode(state) {
	const serializable = {
		s: state.setupCode,
		t: state.testCases.map((tc) => ({ i: tc.id, n: tc.name, c: tc.code })),
		n: state.iterations,
		m: state.minTime
	};
	const json = JSON.stringify(serializable);
	return LZString.compressToEncodedURIComponent(json);
}

export function decode(hash) {
	if (!hash) return null;
	try {
		const json = LZString.decompressFromEncodedURIComponent(hash);
		if (!json) return null;
		const data = JSON.parse(json);
		return {
			setupCode: data.s ?? undefined,
			testCases: data.t?.map((tc) => ({ id: tc.i, name: tc.n, code: tc.c })) ?? undefined,
			iterations: data.n ?? undefined,
			minTime: data.m ?? undefined
		};
	} catch {
		return null;
	}
}
