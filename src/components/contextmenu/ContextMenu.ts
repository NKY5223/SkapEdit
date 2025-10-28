import { Vec2 } from "../../common/vec2.ts";
import { createId } from "@common/uuid.ts";
import { IconName } from "@components/icon/icons.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { Reducer, createContext, useContext } from "react";

/*
Goal:
Extensible (how?) context menu, anchored at a parent
children should call the "create context menu" function
maybe children can be responsible for collecting the parents' context menus?
 */

export namespace ContextMenu {
	type ItemBase<T extends string, P> = {
		type: T;
		id: string;
		/** 
		 * Will be used for the display of the item.  
		 * `<Translate k="contextmenu.item.name" name={name} />`
		 * @example "editor.delete" */
		name: string;
		icon: IconName | null;
	} & P;
	export type SingleItem = ItemBase<"single", {
		click?: () => void;
		closesMenu?: boolean;
	}>;
	export type Section = ItemBase<"section", {
		items: readonly (SingleItem | Submenu)[];
	}>;
	export type Submenu = ItemBase<"submenu", {
		items: readonly Item[];
	}>;
	export type Item = (
		| SingleItem
		| Section
		| Submenu
	);

	export type Floating = {
		readonly type: "floating";
		readonly items: readonly Item[];
		readonly pos: Vec2;
	}
	export type Anchored = {
		readonly type: "anchored";
		readonly items: readonly Item[];
	}
	export type Menu = {
		id?: string;
		opened: readonly string[];
		menu: (
			| Floating
			| Anchored
		);
	};
}

// #region Constructors
export const makeSingle = (
	/** The item will display ``<Translate k={`contextmenu.item.${name}`} />``*/
	name: string,
	icon?: IconName | null,
	click?: () => void,
	closesMenu?: boolean,
): ContextMenu.SingleItem => ({
	type: "single",
	id: createId("cmenu-single"),
	name,
	icon: icon ?? null,
	click,
	closesMenu,
});

type SectionPref = {
	name: string;
	icon: IconName | null;
};
export const Sections = {
	layout: {
		name: "layout",
		icon: "dashboard",
	},
	viewport: {
		name: "viewport",
		icon: "monitor",
	},
} as const satisfies Record<string, SectionPref>;

export const makeSection = ({ name, icon }: SectionPref, items: readonly (ContextMenu.SingleItem | ContextMenu.Submenu)[]): ContextMenu.Section => ({
	type: "section",
	id: createId("cmenu-section"),
	icon,
	name,
	items,
});
export const makeSubmenu = (name: string, icon: IconName | null, items: readonly ContextMenu.Item[]): ContextMenu.Submenu => ({
	type: "submenu",
	id: createId("cmenu-submenu"),
	icon,
	name,
	items,
});


type ContextMenuAction = ({
	type: "set_pos";
	pos: Vec2;
} |
{
	type: "clear_items";
} |
{
	type: "add_items";
	items: readonly ContextMenu.Item[];
});
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
};
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
};
const [useContextMenuValue, useContextMenuDispatch, ContextMenuContextProvider, useContextMenuValueDispatch] = createReducerContext("ContextMenu", contextMenuReducer);

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
};
/**
 * @example
 *
 * const contextMenu = useContextMenu([...]);
 *
 * <div {...contextMenu}>
 */

export const useContextMenu = (items: readonly ContextMenu.Item[]) => {
	const dispatch = useContextMenuDispatch();
	return {
		onContextMenuCapture: () => {
			dispatch({
				type: "add_items",
				items,
			});
		}
	};
};

export const useClearContextMenu = () => {
	return useContext(clearContextMenuContext);
};
// #endregion