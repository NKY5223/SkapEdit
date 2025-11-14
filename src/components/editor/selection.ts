import { ID } from "@common/uuid.ts";
import { SkapMap, SkapObject, SkapRoom } from "@editor/map.ts";
import { SkapMovingObstacle } from "@editor/object/moving.tsx";
import { getObject, getRoom } from "@editor/reducer.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { Reducer } from "react";

export type SelectionItem = (
	| {
		type: "object";
		id: ID;
	}
	| {
		type: "room";
		id: ID;
	}
	| {
		type: "node_movingObject";
		objectId: ID;
		nodeIndex: number;
	}
);
export type SelectableItem = (
	| {
		type: "object";
		object: SkapObject;
	}
	| {
		type: "room";
		room: SkapRoom;
	}
	| {
		type: "node_movingObject";
		object: SkapObject & { type: `moving${string}` };
		nodeIndex: number;
		node: SkapMovingObstacle["points"][number];
	}
);

export type EditorSelection =
	| readonly SelectionItem[];

type SelectionAction = (
	| {
		type: "set_selection";
		selection: EditorSelection;
	}
	| {
		type: "clear_selection";
	}
	| {
		type: "add_item";
		item: SelectionItem;
	}
	| {
		type: "remove_item";
		item: SelectionItem;
	}
);

// #region constructors
export const makeObjectSelectableItem = (object: SkapObject): SelectableItem => ({ type: "object", object });
export const makeRoomSelectableItem = (room: SkapRoom): SelectableItem => ({ type: "room", room });
export const makeNodeSelectableItem = (object: SkapObject & { type: `moving${string}` }, nodeIndex: number): SelectableItem => ({ 
	type: "node_movingObject", 
	object,
	nodeIndex,
	node: object.points[nodeIndex]
});

export const makeObjectSelectionItem = (object: SkapObject): SelectionItem => ({ type: "object", id: object.id });
export const makeRoomSelectionItem = (room: SkapRoom): SelectionItem => ({ type: "room", id: room.id });

export const selectableToSelection = (selectable: SelectableItem): SelectionItem => {
	switch (selectable.type) {
		case "object": {
			return {
				type: selectable.type,
				id: selectable.object.id,
			};
		}
		case "room": {
			return {
				type: selectable.type,
				id: selectable.room.id,
			};
		}
		case "node_movingObject": {
			return {
				type: selectable.type,
				objectId: selectable.object.id,
				nodeIndex: selectable.nodeIndex,
			}
		}
	}
}
export const selectionToSelectable = (selection: SelectionItem, map: SkapMap): SelectableItem => {
	switch (selection.type) {
		case "object": {
			const object = getObject(map, selection.id);
			if (!object) throw new Error(`No object with id ${selection.id}`);
			return {
				type: selection.type,
				object,
			};
		}
		case "room": {
			const room = getRoom(map, selection.id);
			if (!room) throw new Error(`No room with id ${selection.id}`);
			return {
				type: selection.type,
				room,
			};
		}
		case "node_movingObject": {
			const object = getObject(map, selection.objectId);
			if (!object) throw new Error(`No object with id ${selection.objectId}`);
			if (!("points" in object)) throw new Error(`Object is not a movingObject`);
			return {
				type: selection.type,
				object,
				nodeIndex: selection.nodeIndex,
				node: object.points[selection.nodeIndex],
			}
		}
	}
}
export const selectionInRoom = (selection: SelectionItem, room: SkapRoom): boolean => {
	switch (selection.type) {
		case "object": {
			return room.objects.has(selection.id);
		}
		case "room": {
			return room.id === selection.id;
		}
		case "node_movingObject": {
			return room.objects.has(selection.objectId);
		}
	}
}
// #endregion

const selectionReducer: Reducer<EditorSelection, SelectionAction> = (selection, action) => {
	switch (action.type) {
		case "set_selection": {
			return action.selection;
		}
		case "clear_selection": {
			return [];
		}
		case "add_item": {
			return [...selection, action.item];
		}
		case "remove_item": {
			return selection.filter(s => {
				switch (s.type) {
					case "object":
					case "room":
						{
							if (action.item.type !== s.type) return true;
							if (action.item.id !== s.id) return true;
							return false;
						}
					case "node_movingObject": {
						if (action.item.type !== s.type) return true;
						if (action.item.objectId !== s.objectId) return true;
						if (action.item.nodeIndex !== s.nodeIndex) return true;
					}
				}
			});
		}
	}
	action satisfies never;
	return selection;
};

export const selectionKey = (selection: SelectionItem): string => {

	switch (selection.type) {
		case "object":
		case "room":
			{
				return `${selection.type}_${selection.id}`;
			}
		case "node_movingObject": {
			return `${selection.type}_${selection.objectId}_${selection.nodeIndex}`;
		}
	}
}

export const [useEditorSelection, useDispatchSelection, SelectionProvider] =
	createReducerContext<EditorSelection, SelectionAction>("Selection", selectionReducer);
