import { ID } from "@common/uuid.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { Reducer } from "react";

export type EditorSelection = 
	| null
	| {
		type: "object";
		id: ID;
	}
	| {
		type: "room";
		id: ID;
	};

type SelectionAction = (
	| {
		type: "set_selection";
		selection: EditorSelection;
	}
);

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
