import { Tuple } from "./tuple.ts";

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
export function transposeEmpty<T, U>(array: T[][], empty: U): (T | U)[][] {
	return range(Math.max(...array.map(a => a.length))).map(i => (
		range(array.length).map(j => i < array[j].length ? array[j][i] : empty)
	));
}
type MapArray<T extends unknown[]> = {
	[i in keyof T]: T[i][];
};
/** `transpose`, but typed for use with tuples of arrays */
export function transposeTuples<T extends unknown[]>(array: MapArray<T>): T[] {
	return transpose(array) as T[];
}
export function transpose<T>(array: T[][]): T[][] {
	return range(Math.max(...array.map(a => a.length))).map(i => (
		range(array.length).map(j => array[j][i])
	));
}
const interleaveEmpty = Symbol("interleave-empty");
/**
 * will keep pushing elements even if array is too short. e.g.:  
 * `interleave(["a", "b", "c", "d"], [0, 1]) ↦ ["a", 0, "b", 1, "c", "d"]`
 */
export function interleave<T>(...arrays: T[][]): T[] {
	return transposeEmpty(arrays, interleaveEmpty)
		.flat()
		.filter((x): x is T => x !== interleaveEmpty);
}

export function cyclicalSlice<T>(array: T[], start: number, length: number): T[] {
	return range(length).map(i => array[(i + start) % array.length]);
}

/**
 * breaks array into tuples, e.g:
 * `tuples([0, 1, 2, 3, 4], 2) ↦ [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]`
 */
export function tuplesCyclical<T>(array: T[], length: number): T[][] {
	return array.map((_, i) => cyclicalSlice(array, i, length));
}
/**
 * breaks array into tuples, e.g:
 * `tuples([0, 1, 2, 3, 4], 2) ↦ [[0, 1], [1, 2], [2, 3], [3, 4]]`
 */
export function tuples<T, N extends number>(array: T[], length: N): Tuple<T, N>[] {
	if (array.length < length) throw new Error(`cannot convert ${array} into ${length}-tuples because it's too short`);
	return range(array.length - length + 1).map((_, i) => array.slice(i, i + length) as Tuple<T,N>);
}