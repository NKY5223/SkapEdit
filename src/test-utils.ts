export function cross<T extends unknown[], U extends unknown>(
	f: (...args: T) => U,
	...arrays: { [i in keyof T]: T[i][] }
): U[] {
	return indices(arrays.map(arr => arr.length), false)
		.map(is => f(...is.map((i, j) => arrays[j][i]) as T));
}
function indices(lengths: number[], startLSD: boolean = false): number[][] {
	if (lengths.length === 1) return range(lengths[0]).map(i => [i]);
	const rest = indices(startLSD ? lengths.slice(0, -1) : lengths.slice(1), startLSD);
	return range(lengths[0]).flatMap(i => rest.map(arr => [i, ...arr]));
}
export function range(end: number, start: number = 0, step: number = 1): number[] {
	return Array.from({ length: Math.floor((end - start) / step) }, (_, i) => i * step + start);
}

export function unique<T>(arr: T[], equal: (a: T, b: T) => boolean) {
	const res: T[] = [];
	for (let a of arr) {
		if (!res.some(b => equal(a, b))) {
			res.push(a);
		}
	}
	return res;
}
export function reverseMap<K, V>(map: Iterable<[K, V]>): Map<V, K[]> {
	const res = new Map<V, K[]>();
	for (const [key, value] of map) {
		if (!res.get(value)?.push?.(key))
			res.set(value, [key]);
	}
	return res;
}