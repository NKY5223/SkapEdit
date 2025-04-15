
export function toMap<T, K extends string = string>(obj: Partial<Record<K, T>>): ReadonlyMap<K, T> {
	return new Map(Object.entries(obj) as [K, T][]);
}
