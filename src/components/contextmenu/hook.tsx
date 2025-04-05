import { vec2 } from "@common/vec2.ts";
import { useContext } from "react";
import { contextMenuContext } from "./context.tsx";
import { ContextMenuFloating } from "./ContextMenu.tsx";

type UpdateContextMenu = ContextMenuFloating["content"];
export const useContextMenu = (
	action: UpdateContextMenu | ((prev: ContextMenuFloating | null) => UpdateContextMenu)
) => {
	const dispatch = useContext(contextMenuContext);
	return (event: React.MouseEvent) => {
		event.preventDefault();
		dispatch(current => ({
			type: "floating",
			pos: vec2(event.clientX, event.clientY),
			content: typeof action === "function" ? action(current) : action,
		}));
	};
};
export const useClearContextMenu = () => {
	const dispatch = useContext(contextMenuContext);
	return () => dispatch(null);
};
