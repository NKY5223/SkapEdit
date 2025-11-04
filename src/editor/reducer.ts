import { ID } from "@common/uuid.ts";
import { idMapWith, mapWithout } from "@components/utils.tsx";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { Reducer } from "react";
import { SkapMap, SkapObject, SkapRoom } from "./map.ts";

export const getRoom = (
	map: SkapMap,
	targetRoom: ID,
): SkapRoom | null => {
	return map.rooms.get(targetRoom) ?? null;
}
export const getObject = (
	map: SkapMap,
	targetObject: ID
): SkapObject | null => {
	for (const [_, room] of map.rooms) {
		for (const [id, object] of room.objects) {
			if (id === targetObject) return object;
		}
	}
	return null;
};
export const findInRoom = (
	room: SkapRoom,
	targetObject: TargetObject
): [id: ID, obj: SkapObject] | undefined => room.objects.entries().find(([, obj]) => matches(obj, targetObject));
/**
 * @returns If object was successfully replaced, returns `[true, newRoom]`. Else, `[false, oldRoom]`.
*/
export const setInRoom = (
	room: SkapRoom,
	targetObject: TargetObject,
	/** function that transforms old object into new object */
	replace: (node: SkapObject) => SkapObject
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
};
type TargetObject = ID | ((obj: SkapObject) => boolean);
const matches = (obj: SkapObject, target: TargetObject) => {
	if (typeof target === "string") return obj.id === target;
	return target(obj);
};
type SkapMapAction = (
	| {
		type: "replace_map";
		map: SkapMap;
	}
	| {
		type: "replace_room";
		/** Room ID. */
		target: ID;
		/** Replacement function that returns new room, given old room. */
		replacement: (prevRoom: SkapRoom) => SkapRoom;
	}
	| {
		type: "replace_object";
		/** Either an `ID` or a filter function. */
		target: TargetObject;
		/** Replacement function that returns new object, given old object. */
		replacement: (prevObject: SkapObject) => SkapObject;
	}
	| {
		type: "remove_object";
		/** Either an `ID` or a filter function. */
		target: TargetObject;
	}
	| {
		type: "add_object";
		roomId: ID;
		object: SkapObject;
	}
);
const skapMapReducer: Reducer<SkapMap, SkapMapAction> = (map, action) => {
	switch (action.type) {
		case "replace_map": {
			return action.map;
		}
		case "replace_room": {
			const { target, replacement } = action;
			const room = map.rooms.get(target);
			if (!room) return map;
			const newRoom = replacement(room);
			return {
				...map,
				rooms: idMapWith(map.rooms, newRoom),
			};
		}
		case "replace_object": {
			const { target, replacement } = action;
			for (const room of map.rooms.values()) {
				const [success, newRoom] = setInRoom(room, target, replacement);
				if (!success) continue;
				return {
					...map,
					rooms: idMapWith(map.rooms, newRoom),
				};
			}
			console.warn("No room found with object");
			return map;
		}
		case "remove_object": {
			const { target } = action;
			for (const room of map.rooms.values()) {
				const match = findInRoom(room, target);
				if (!match) return map;
				const [id,] = match;
				const newRoom = {
					...room,
					objects: mapWithout(room.objects, id),
				};
				return {
					...map,
					rooms: idMapWith(map.rooms, newRoom),
				};
			}
			return map;
		}
		case "add_object": {
			const { roomId: roomId, object } = action;
			const room = map.rooms.get(roomId);
			if (!room) return map;
			const newRoom: SkapRoom = {
				...room,
				objects: idMapWith(room.objects, object),
			};
			return {
				...map,
				rooms: idMapWith(map.rooms, newRoom),
			};
		}
	}
	return map;
};
export const [useSkapMap, useDispatchSkapMap, SkapMapProvider] = createReducerContext("Map", skapMapReducer);
