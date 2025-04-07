import { ReactNode } from "react";
import { Vec2 } from "../../common/vec2.ts";

/*
Goal:
Extensible (how?) context menu, anchored at a parent
children should call the "create context menu" function
maybe children can be responsible for collecting the parents' context menus?
 */

export namespace ContextMenu {
	type ItemBase<T extends string, P> = {
		type: T;
		/** A unique string representing this item */
		id: string;
	} & P;
	export type SingleItem = ItemBase<"single", {
		display: ReactNode;
		click?: () => void;
	}>;
	export type Section = ItemBase<"section", {
		title?: ReactNode;
		items: readonly (SingleItem | Submenu)[];
	}>;
	export type Submenu = ItemBase<"submenu", {
		display: ReactNode;
		items: readonly Item[];
		opened: boolean;
	}>;
	export type Item = (
		| SingleItem
		| Section
		| Submenu
	);

	export type Floating = {
		type: "floating";
		readonly items: readonly Item[];
		pos: Vec2;
	}
	export type Anchored = {
		type: "anchored";
		readonly items: readonly Item[];
	}
	export type ContextMenu = (
		| Floating
		| Anchored
	);
}

// #region Constructors
export const single = (id: string, display: ReactNode, click?: () => void): ContextMenu.SingleItem => ({
	type: "single",
	id,
	display,
	click,
});
export const section = (id: string, title: ReactNode, items: (ContextMenu.SingleItem | ContextMenu.Submenu)[]): ContextMenu.Section => ({
	type: "section",
	id,
	title,
	items,
});
export const submenu = (id: string, display: ReactNode, items: readonly ContextMenu.Item[]): ContextMenu.Submenu => ({
	type: "submenu",
	id,
	display,
	opened: false,
	items,
});
// #endregion