import { ID } from "@common/uuid.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";

export type EditorSelection = ID | null;

type SelectionAction = never;

export const [useSelection, useDispatchSelection, SelectionProvider] =
	createReducerContext<EditorSelection, SelectionAction>("Selection", (id, _) => id);
