import { createContext, Reducer, useContext } from "react";
import { ContextMenu } from "./ContextMenu.ts";
import { Vec2 } from "@common/vec2.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";


/*

When user right clicks on an element:

onContextMenuCapture goes down the tree.
onContextMenu goes up the tree.

When provider receives onContextMenuCapture, clear the menu.
When children receive onContextMenuCapture, add items.

When provider receives onContextMenu, update context menu.
This allows children to stop contextmenu propagation.

*/

type ContextMenuAction = (
	| {
		type: "set_pos";
		pos: Vec2;
	}
	| {
		type: "clear_items";
	}
	| {
		type: "add_items";
		items: readonly ContextMenu.Item[];
	}
);
export type ContextMenuInfo = {
	readonly pos: Vec2;
	readonly items: readonly (readonly ContextMenu.Item[])[];
};

const contextMenuReducer: Reducer<ContextMenuInfo, ContextMenuAction> = (state, action) => {
	switch (action.type) {
		case "set_pos": {
			const { pos } = action;
			return { ...state, pos };
		}
		case "clear_items": {
			return { ...state, items: [], };
		}
		case "add_items": {
			const { items } = action;
			return { ...state, items: [...state.items, items], };
		}
	}
}
export const mergeItems = <T extends ContextMenu.Item>(items: readonly T[], newItems: readonly T[]): T[] => {
	return newItems.reduce((items, item): T[] => {
		switch (item.type) {
			case "single": {
				return [...items, item];
			}
			case "section": {
				const { name, items: sectionItems } = item;
				const match = items.entries()
					.filter(([, item]) => item.type === "section")
					.find(([, item]) => item.name === name);
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
				const match = items.entries()
					.filter(([, item]) => item.type === "submenu")
					.find(([, item]) => item.name === name);
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

const [useContextMenuValue, useContextMenuDispatch, ContextMenuContextProvider, useContextMenuValueDispatch] = 
	createReducerContext("ContextMenu", contextMenuReducer);

export const clearContextMenuContext = createContext(() => console.warn("clearContextMenuContext Provider missing"));

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
	return useContext(clearContextMenuContext);
}