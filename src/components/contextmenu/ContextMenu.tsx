import { ReactNode } from "react";
import { Vec2 } from "../../common/vec2.ts";
import { createId } from "@common/uuid.ts";

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
		/** @example "editor" */
		name: string;
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
export const single = (name: string, display: ReactNode, click?: () => void): ContextMenu.SingleItem => ({
	type: "single",
	id: createId("cmenu-item"),
	name,
	display,
	click,
});
export const section = (name: string, title: ReactNode, items: (ContextMenu.SingleItem | ContextMenu.Submenu)[]): ContextMenu.Section => ({
	type: "section",
	id: createId("cmenu-item"),
	name,
	title,
	items,
});
export const submenu = (name: string, display: ReactNode, items: readonly ContextMenu.Item[]): ContextMenu.Submenu => ({
	type: "submenu",
	id: createId("cmenu-item"),
	name,
	display,
	items,
});
// #endregion