import { ID } from "@common/uuid.ts";
import { Dispatch, DOMAttributes, FC, KeyboardEventHandler, SetStateAction } from "react";

export const toClassName = (...list: (string | undefined | null | false | string[])[]) =>
	list.filter((s): s is string | string[] => !!s).flat().join(" ");

export type ExtensibleFC<T> = FC<T & {
	classList?: string[];
}>;

export const toDispatchSetStateAction = <S,>(dispatch: Dispatch<S>, state: S): Dispatch<SetStateAction<S>> =>
	action => {
		if (typeof action === "function")
			action = (action as (s: S) => S)(state);
		dispatch(action);
	}

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

// Should this just check if `document.direction === "rtl"`?
export function elementIsRtl(target: Element) {
	return window.getComputedStyle(target).direction === "rtl";
}

export type ListenerAttributeNames = keyof DOMAttributes<Element> & `on${string}`;
export type ListenerAttributes<T = unknown> = Pick<DOMAttributes<T>, ListenerAttributeNames>;
export const mergeListeners = <T = unknown>(...listeners: ListenerAttributes<T>[]): ListenerAttributes<T> => {
	return Object.fromEntries(Map.groupBy(listeners.flatMap(l => Object.entries(l)), ([k]) => k).entries().map(([k, [, l]]) => [k, l]));
}