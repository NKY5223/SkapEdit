import { ID } from "@common/uuid.ts";
import { FC } from "react";

export const classList = (...list: (string | undefined | null | false)[]) => list.filter(s => !!s).join(" ");

export type ExtensibleFC<T> = FC<T & {
	classes?: string[];
}>;

export const mapWith = <K, T>(map: ReadonlyMap<K, T>, key: K, value: T) => {
	const newMap = new Map(map);
	newMap.set(key, value);
	return newMap;
}
export const mapWithout = <K, T>(map: ReadonlyMap<K, T>, key: K) => {
	const newMap = new Map(map);
	newMap.delete(key);
	return newMap;
}
export const idMapWith = <T extends { id: ID }>(map: ReadonlyMap<ID, T>, value: T) =>
	mapWith(map, value.id, value);