import { ID } from "@common/uuid.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";

export type EditorSelection = ID | null;

export const [useSelection, useDispatchSelection, SelectionProvider] =
	createReducerContext<ID | null, {}>("Selection", (id, _) => id);
