import { Reducer } from "react";
import { ContextMenu } from "./ContextMenu.ts";
import { vec2 } from "@common/vec2.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";


/*

When user right clicks on an element:

onContextMenuCapture goes down the tree.
onContextMenu goes up the tree.

When provider receives onContextMenuCapture, clear the menu.
When children receive onContextMenuCapture, add items.

provider will rerender and render the contextmenu anyways
// When provider receives onContextMenu, show context menu.

*/

type ContextMenuAction = (
	| {
		type: "set",
		menu: ContextMenu.Floating | null;
	}
	| {
		type: "add_items",
		items: readonly ContextMenu.Item[];
	}
);

const contextMenuReducer: Reducer<ContextMenu.Floating | null, ContextMenuAction> = (state, action) => {
	switch (action.type) {
		case "set": {
			const { menu } = action;
			return menu;
		}
		case "add_items": {
			const { items } = action;
			if (state === null) {
				return {
					type: "floating",
					pos: vec2(100),
					items,
				}
			}
			return {
				...state,
				items: mergeItems(state.items, items),
			};
		}
	}
}
const mergeItems = <T extends ContextMenu.Item>(items: readonly T[], newItems: readonly T[]): T[] => {
	return newItems.reduce((items, item): T[] => {
		switch (item.type) {
			case "single": {
				return [...items, item];
			}
			case "section": {
				const { name, items: sectionItems } = item;
				const match = items.entries().find(([, item]) => item.type === "section" && item.name === name);
				if (!match) {
					return [...items, item];
				}
				const [i, section] = match;
				if (section.type !== "section") {
					throw new Error("Item that was section is no longer section. This should not be possible.");
				}
				return items.with(i, {
					...section,
					items: mergeItems(sectionItems, section.items)
				});
			}
			case "submenu": {
				const { name, items: submenuItems } = item;
				const match = items.entries().find(([, item]) => item.type === "submenu" && item.name === name);
				if (!match) {
					return [...items, item];
				}
				const [i, submenu] = match;
				if (submenu.type !== "submenu") {
					throw new Error("Item that was submenu is no longer submenu. This should not be possible.");
				}
				return items.with(i, {
					...submenu,
					items: mergeItems(submenuItems, submenu.items)
				});
			}
		}
	}, [...items]);
}

const [useContextMenuValue, useContextMenuDispatch, ContextMenuContextProvider, useContextMenuValueDispatch] = createReducerContext("ContextMenu", contextMenuReducer);

export {
	/** Do not use. */
	useContextMenuValue,
	/** Do not use; Use `useContextMenu` instead. */
	useContextMenuDispatch,
	/** Do not use. */
	useContextMenuValueDispatch,
	/** Do not use; Use `ContextMenuProvider` instead. */
	ContextMenuContextProvider,
}

/**
 * @example
 * 
 * const addContextMenuItems = useContextMenu([...]);
 * 
 * <div onContextMenuCapture={addContextMenuItems}>
 */
export const useContextMenu = (items: readonly ContextMenu.Item[]): React.MouseEventHandler => {
	const dispatch = useContextMenuDispatch();
	return () => {
		dispatch({
			type: "add_items",
			items,
		});
	}
}

export const useClearContextMenu = () => {
	const dispatch = useContextMenuDispatch();
	return () => {
		dispatch({
			type: "set",
			menu: null,
		});
	}
}