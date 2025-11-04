import { ID } from "@common/uuid.ts";
import { SkapMap, SkapObject, SkapRoom } from "@editor/map.ts";
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
		itemId: ID;
	}
);

// #region constructors
export const makeObjectSelectableItem = (object: SkapObject): SelectableItem => ({ type: "object", object });
export const makeRoomSelectableItem = (room: SkapRoom): SelectableItem => ({ type: "room", room });

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
	}
}
// #endregion

const selectionReducer: Reducer<EditorSelection, SelectionAction> = (selection, action) => {
	console.log(selection, action);
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
			return selection.filter(s => s.id !== action.itemId);
		}
	}
	action satisfies never;
	return selection;
};
export const [useEditorSelection, useDispatchSelection, SelectionProvider] =
	createReducerContext<EditorSelection, SelectionAction>("Selection", selectionReducer);
