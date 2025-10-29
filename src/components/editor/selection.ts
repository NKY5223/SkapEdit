import { ID } from "@common/uuid.ts";
import { SkapObject, SkapRoom } from "@editor/map.ts";
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
	| SelectionItem[];

type SelectionAction = (
	| {
		type: "set_selection";
		selection: EditorSelection;
	}
);

// #region constructors
export const makeObjectSelectableItem = (object: SkapObject): SelectableItem => ({ type: "object", object });
export const makeRoomSelectableItem = (room: SkapRoom): SelectableItem => ({ type: "room", room });

export const convertSelectableToSelection = (selectable: SelectableItem): SelectionItem => {
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
// #endregion

const selectionReducer: Reducer<EditorSelection, SelectionAction> = (selection, action) => {
	switch (action.type) {
		case "set_selection": {
			return action.selection;
		}
	}
	return selection;
};
export const [useEditorSelection, useDispatchSelection, SelectionProvider] =
	createReducerContext<EditorSelection, SelectionAction>("Selection", selectionReducer);
