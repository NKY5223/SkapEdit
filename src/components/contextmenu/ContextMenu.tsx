import { ReactNode } from "react";
import { Vec2 } from "../../common/vec2.ts";

/*
Goal:
Extensible (how?) context menu, anchored at a parent
children should call the "create context menu" function
maybe children can be responsible for collecting the parents' context menus?
 */

// #region types

// #region item
export type ContextMenuSingleItem = {
	type: "single";
	/** A (readable) string representing this item */
	id: string;
	display: ReactNode;
	click?: () => void;
};
export type ContextMenuSubmenu = {
	type: "submenu";
	/** A (readable) string representing this item */
	id: string;
	display: ReactNode;
	menu: ContextMenuAnchored;
}
export type ContextMenuSection = {
	type: "section";
	/** A (readable) string representing this section */
	id: string;

	title?: ReactNode;
	items: (ContextMenuSingleItem | ContextMenuSubmenu)[];
}
export type ContextMenuItem = (
	| ContextMenuSingleItem
	| ContextMenuSubmenu
	| ContextMenuSection
);
// #endregion

export type ContextMenuContent = {
	readonly items: readonly ContextMenuItem[];
}

// #region menu
export type ContextMenuFloating = {
	type: "floating";
	content: ContextMenuContent;
	pos: Vec2;
}
export type ContextMenuAnchored = {
	type: "anchored";
	content: ContextMenuContent;
}
export type ContextMenu = (
	| ContextMenuFloating
	| ContextMenuAnchored
);
// #endregion

// #endregion

// #region Constructors
export const single = (id: string, display: ReactNode, click?: () => void): ContextMenuSingleItem => ({
	type: "single",
	id,
	display,
	click,
});
export const section = (id: string, title: ReactNode, items: (ContextMenuSingleItem | ContextMenuSubmenu)[]): ContextMenuSection => ({
	type: "section",
	id,
	title,
	items,
});
export const submenu = (id: string, display: ReactNode, items: ContextMenuAnchored["content"]["items"]): ContextMenuSubmenu => ({
	type: "submenu",
	id,
	display,
	menu: {
		type: "anchored",
		content: { items },
	},
});
// #endregion