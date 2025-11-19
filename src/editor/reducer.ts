import { ID } from "@common/uuid.ts";
import { idMapWith, mapWithout } from "@components/utils.tsx";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { Reducer, SetStateAction } from "react";
import { SkapMap, SkapObject, SkapRoom } from "./map.ts";
import { maybeConst } from "@common/maybeConst.ts";

export const getRoom = (
	map: SkapMap,
	targetRoom: ID,
): SkapRoom | null => {
	return map.rooms.get(targetRoom) ?? null;
}

export const getObjects = (
	map: SkapMap,
): SkapObject[] => {
	return map.rooms.values().flatMap(room => room.objects.values()).toArray();
}

export const getObjectsWithRoom = (
	map: SkapMap,
): (readonly [object: SkapObject, room: SkapRoom])[] => {
	return map.rooms.values()
		.flatMap(room => room.objects.values()
			.map(obj => [obj, room] as const)
		)
		.toArray();
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
		replacement: SetStateAction<SkapMap>;
	}
	| {
		type: "replace_room";
		/** Room ID. */
		target: ID;
		/** Replacement function that returns new room, given old room. */
		replacement: (prevRoom: SkapRoom) => SkapRoom;
	}
	| {
		type: "remove_room";
		roomId: ID;
	}
	| {
		type: "add_room";
		room: SkapRoom;
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
	| {
		type: "set_edited";
		edited: boolean;
	}
);
const skapMapReducer: Reducer<SkapMap, SkapMapAction> = (map, action) => {
	switch (action.type) {
		case "replace_map": {
			return maybeConst(action.replacement, map);
		}
		case "replace_room": {
			const { target, replacement } = action;
			const room = map.rooms.get(target);
			if (!room) return map;
			const newRoom = replacement(room);
			return {
				...map,
				edited: true,
				rooms: idMapWith(map.rooms, newRoom),
			};
		}
		case "add_room": {
			const { room } = action;
			return {
				...map,
				edited: true,
				rooms: idMapWith(map.rooms, room),
			};
		}
		case "remove_room": {
			const { roomId } = action;
			return {
				...map,
				edited: true,
				rooms: mapWithout(map.rooms, roomId),
			};
		}
		case "replace_object": {
			const { target, replacement } = action;
			for (const room of map.rooms.values()) {
				const [success, newRoom] = setInRoom(room, target, replacement);
				if (!success) continue;
				return {
					...map,
					edited: true,
					rooms: idMapWith(map.rooms, newRoom),
				};
			}
			console.warn("No room found with object");
			return map;
		}
		case "remove_object": {
			const { target } = action;
			for (const [, room] of map.rooms) {
				const match = findInRoom(room, target);
				if (!match) continue;
				const [id,] = match;
				const newRoom = {
					...room,
					objects: mapWithout(room.objects, id),
				};
				return {
					...map,
					edited: true,
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
				edited: true,
				rooms: idMapWith(map.rooms, newRoom),
			};
		}
		case "set_edited": {
			const { edited } = action;
			return {
				...map,
				edited
			};
		}
	}
	return map;
};
export const [useSkapMap, useDispatchSkapMap, SkapMapProvider] = createReducerContext("Map", skapMapReducer);
