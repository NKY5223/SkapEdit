export type Realize<T> = {
	[i in keyof T]: T[i];
} & {};
export type Values<T> = T[keyof T];
export type UnionToIntersection<U> = Parameters<U extends U ? (_: U) => void : never>;