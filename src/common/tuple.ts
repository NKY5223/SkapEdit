export type ReadonlyTuple<T, N extends number> = ReadonlyTupleInternal<T, N, []> & readonly T[] & { length: N; };
type ReadonlyTupleInternal<T, N extends number, A extends readonly T[]> = A["length"] extends N ? A : ReadonlyTupleInternal<T, N, readonly [...A, T]>;

export type Tuple<T, N extends number> = TupleInternal<T, N, []> & T[] & { length: N; };
type TupleInternal<T, N extends number, A extends T[]> = A["length"] extends N ? A : TupleInternal<T, N, [...A, T]>;

export const map = <T, U, N extends number>(
	tuple: ReadonlyTuple<T, N>,
	f: (value: T, i: number, values: readonly T[]) => U
): ReadonlyTuple<U, N> => tuple.map(f) as ReadonlyTuple<U, N>;

export const tuple = <T, N extends number>(n: N, f: (i: number) => T): ReadonlyTuple<T, N> => (
	Array.from({ length: n }, (_, i) => f(i)) as ReadonlyTuple<T, N>
);