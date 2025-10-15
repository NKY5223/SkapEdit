import { Vec2 } from "../../common/vec2.ts";
import { createId } from "@common/uuid.ts";
import { IconName } from "@components/icon/IconName.ts";

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
		/** @example "editor.delete" */
		name: string;
		icon: IconName | null;
	} & P;
	export type SingleItem = ItemBase<"single", {
		click?: () => void;
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
export const single = (
	/** The item will display ``<Translate k={`contextmenu.item.${name}`} />``*/ 
	name: string, 
	icon?: IconName | null, 
	click?: () => void
): ContextMenu.SingleItem => ({
	type: "single",
	id: createId("cmenu-single"),
	name,
	icon: icon ?? null,
	click,
});
export const section = (name: string, icon: IconName | null, items: readonly (ContextMenu.SingleItem | ContextMenu.Submenu)[]): ContextMenu.Section => ({
	type: "section",
	id: createId("cmenu-section"),
	icon,
	name,
	items,
});
export const submenu = (name: string, icon: IconName | null, items: readonly ContextMenu.Item[]): ContextMenu.Submenu => ({
	type: "submenu",
	id: createId("cmenu-submenu"),
	icon,
	name,
	items,
});
// #endregion