import { Reducer } from "react";
import { Bounds, BoundsInit } from "./bounds.ts";
import { vec2, Vec2 } from "../common/vec2.ts";
import { createId, ID } from "@common/uuid.ts";
import { Color } from "@common/color.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { idMapWith, mapWithout } from "@components/utils.tsx";

// #region types
type BaseObject<T extends string, P> = {
	type: T;
	id: string;
} & P;
export type SkapObstacle = BaseObject<"obstacle", {
	bounds: Bounds;
}>;
export type SkapLava = BaseObject<"lava", {
	bounds: Bounds;
}>;
export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;

export type SkapObject = (
	| SkapObstacle
	| SkapLava
	| SkapText
);
export type SkapRoom = {
	id: string;
	name: string;
	bounds: Bounds;
	obstacleColor: Color;
	backgroundColor: Color;
	objects: ReadonlyMap<ID, SkapObject>;
};
export type SkapMap = {
	spawn: {
		room: string;
		position: Vec2;
	};
	rooms: ReadonlyMap<ID, SkapRoom>;
};
// #endregion

// #region constructors
export const mkObstacle = (left: number, top: number, right: number, bottom: number): SkapObstacle => ({
	type: "obstacle",
	id: createId(),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const mkLava = (left: number, top: number, right: number, bottom: number): SkapLava => ({
	type: "lava",
	id: createId(),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const mkText = (x: number, y: number, text: string): SkapText => ({
	type: "text",
	id: createId(),
	pos: vec2(x, y),
	text,
});
export const objectWithIdArrayToMap = <T extends { id: ID; }>(objs: T[]): Map<ID, T> =>
	new Map(objs.map(o => [o.id, o]));

export const mkRoom = (name: string, bounds: BoundsInit,
	obstacleColor: Color, backgroundColor: Color, objects: SkapObject[]): SkapRoom => ({
		id: createId("room"),
		name,
		bounds: new Bounds(bounds),
		obstacleColor,
		backgroundColor,
		objects: objectWithIdArrayToMap(objects)
	});
// #endregion

export const getObject = (
	map: SkapMap,
	targetObject: ID,
): SkapObject | null => {
	for (const [_, room] of map.rooms) {
		for (const [id, object] of room.objects) {
			if (id === targetObject) return object;
		}
	}
	return null;
}
export const findInRoom = (
	room: SkapRoom,
	targetObject: TargetObject,
): [id: ID, obj: SkapObject] | undefined =>
	room.objects.entries().find(([, obj]) => matches(obj, targetObject));
/**
 * @returns If object was successfully replaced, returns `[true, newRoom]`. Else, `[false, oldRoom]`.
*/
export const setInRoom = (
	room: SkapRoom,
	targetObject: TargetObject,
	/** function that transforms old object into new object */
	replace: (node: SkapObject) => SkapObject,
): [success: boolean, room: SkapRoom] => {
	const match = findInRoom(room, targetObject);
	if (!match) return [false, room];
	const [, obj] = match;
	const newObj = replace(obj);
	const newObjs = new Map(room.objects);
	newObjs.set(newObj.id, newObj);
	return [true, {
		...room,
		objects: newObjs,
	}];
}

type TargetObject = ID | ((obj: SkapObject) => boolean);
const matches = (obj: SkapObject, target: TargetObject) => {
	if (typeof target === "string") return obj.id === target;
	return target(obj);
}

type SkapMapAction = (
	| {
		type: "replace_object";
		/** Either an `ID` or a filter function. */
		targetObject: TargetObject;
		/** Replacement function that returns new object, given old object. */
		replacement: (prevObject: SkapObject) => SkapObject;
	}
	| {
		type: "remove_object";
		/** Either an `ID` or a filter function. */
		targetObject: TargetObject;
	}
);
const skapMapReducer: Reducer<SkapMap, SkapMapAction> = (map, action) => {
	switch (action.type) {
		case "replace_object": {
			const { targetObject, replacement } = action;
			for (const room of map.rooms.values()) {
				const [success, newRoom] = setInRoom(room, targetObject, replacement);
				if (!success) continue;
				return {
					...map,
					rooms: idMapWith(map.rooms, newRoom),
				}
			}
			console.warn("No room found with object");
			return map;
		}
		case "remove_object": {
			const { targetObject } = action;
			for (const room of map.rooms.values()) {
				const match = findInRoom(room, targetObject);
				if (!match) return map;
				const [id,] = match;
				const newRoom = {
					...room,
					objects: mapWithout(room.objects, id),
				};
				return {
					...map,
					rooms: idMapWith(map.rooms, newRoom),
				}
			}
			return map;
		}
	}
	return map;
}
export const [useSkapMap, useDispatchSkapMap, SkapMapProvider] = createReducerContext("Map", skapMapReducer);

