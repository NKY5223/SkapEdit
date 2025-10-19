import { ID } from "@common/uuid.ts";
import { FC, KeyboardEventHandler } from "react";

export const toClassName = (...list: (string | undefined | null | false | string[])[]) => 
	list.filter((s): s is string | string[] => !!s).flat().join(" ");

export type ExtensibleFC<T> = FC<T & {
	classes?: string[];
}>;

/** Duplicates a map and sets key to value. Preserves order. */
export const mapWith = <K, T>(map: ReadonlyMap<K, T>, key: K, value: T) => {
	const newMap = new Map(map);
	newMap.set(key, value);
	return newMap;
}
/** Duplicates a map and removes key. Preserves order. */
export const mapWithout = <K, T>(map: ReadonlyMap<K, T>, key: K) => {
	const newMap = new Map(map);
	newMap.delete(key);
	return newMap;
}
export const idMapWith = <T extends { id: ID }>(map: ReadonlyMap<ID, T>, value: T) =>
	mapWith(map, value.id, value);
export function filterKeys(f: KeyboardEventHandler, keys = ["Enter", "Space"]): KeyboardEventHandler {
	return e => {
		if (keys.includes(e.code)) {
			f(e);
		}
	};
}
