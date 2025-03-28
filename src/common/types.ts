export type Realize<T> = {
	[i in keyof T]: T[i];
} & {};
export type Values<T> = T[keyof T];
export type UnionToIntersection<U> = Parameters<U extends U ? (_: U) => void : never>;

export type ReadonlyTuple<T, N extends number> = ReadonlyTupleInternal<T, N, []> & readonly T[] & { length: N; };
type ReadonlyTupleInternal<T, N extends number, A extends readonly T[]> =
	A["length"] extends N
	? A
	: ReadonlyTupleInternal<T, N, readonly [...A, T]>;

export type Tuple<T, N extends number> = TupleInternal<T, N, []> & T[] & { length: N; };
type TupleInternal<T, N extends number, A extends T[]> =
	A["length"] extends N
	? A
	: TupleInternal<T, N, [...A, T]>;
