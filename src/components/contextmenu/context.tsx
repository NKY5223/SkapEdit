import { createContext, Dispatch, FC, PropsWithChildren, useEffect, useContext, Reducer, useReducer } from "react";
import { ContextMenu } from "./ContextMenu.tsx";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";
import { Vec2, vec2, zero } from "@common/vec2.ts";
import { createId } from "@common/uuid.ts";

type RClickContextMenu = {
	id: string;
	menu: ContextMenu.Floating;
};

type ContextMenuAction = (
	| {
		type: "open_submenu";
		target: string;
	}
	| {
		type: "close_submenu";
		target: string;
	}
	| {
		type: "merge";
		pos?: Vec2;
		items: ContextMenu.Item[];
	}
	| {
		type: "set";
		menu: {
			pos: Vec2;
			items: ContextMenu.Item[]
		} | null;
	}
);
const cmenuReducerContext = createContext<Dispatch<ContextMenuAction>>(() => {
	throw new Error("Missing context menu reducer context.");
});
const reducer: Reducer<RClickContextMenu | null, ContextMenuAction> = (menu, action): RClickContextMenu | null => {
	switch (action.type) {
		case "set": {
			const { menu } = action;
			if (!menu) {
				return null;
			}
			const id = createId("cmenu");
			const { pos, items } = menu;
			return {
				id,
				menu: {
					type: "floating",
					pos,
					items,
				}
			};
		}
		case "open_submenu": {
			const { target } = action;
			if (!menu) return menu;
			const [success, items] = openContextMenuSubmenu(menu.menu.items, target);
			if (!success) return menu;
			return {
				...menu,
				menu: {
					...menu.menu,
					items,
				}
			}
		}
		case "close_submenu": {
			const { target } = action;
			if (!menu) return menu;
			const [success, items] = closeContextMenuSubmenu(menu.menu.items, target);
			if (!success) return menu;
			return {
				...menu,
				menu: {
					...menu.menu,
					items,
				}
			}
		}
		case "merge": {
			const { pos = zero, items } = action;
			if (!menu) {
				const id = createId("cmenu");
				return {
					id,
					menu: {
						type: "floating",
						pos,
						items,
					}
				};
			}
			const destItems = menu.menu.items;
			const merged = mergeContextMenuItems(destItems, items);
			return {
				id: menu.id,
				menu: {
					...menu.menu,
					items: merged,
				}
			};
		}
	}
}
export const useCmenuReducer = () => useContext(cmenuReducerContext);

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const [current, dispatch] = useReducer(reducer, null);

	useEffect(() => {
		console.log("cmenu provider mount");
		return () => console.log("cmenu provider unmount");
	}, []);
	return (
		<div data--info="ContextMenuProvider" onContextMenuCapture={() => {
			dispatch({
				type: "set",
				menu: null,
			});
		}}>
			<cmenuReducerContext.Provider value={dispatch}>
				{children}
				{current && <FloatingContextMenu key={current.id} contextMenu={current.menu} />}
			</cmenuReducerContext.Provider>
		</div>
	);
};

export const useContextMenu = (
	items: ContextMenu.Item[]
) => {
	const dispatch = useCmenuReducer();
	return (event: React.MouseEvent) => {
		event.preventDefault();
		dispatch({
			type: "merge",
			pos: vec2(event.clientX, event.clientY),
			items,
		});
	};
};
export const useClearContextMenu = () => {
	const dispatch = useCmenuReducer();
	return () => dispatch({
		type: "set",
		menu: null,
	});
};

const openContextMenuSubmenu = <T extends ContextMenu.Item>(items: readonly T[], id: string):
	[success: boolean, items: readonly T[]] => {
	for (const [i, item] of items.entries()) {
		switch (item.type) {
			case "single": {
				break;
			}
			case "section": {
				const { items: oldItems } = item;
				const [success, newItems] = openContextMenuSubmenu(oldItems, id);
				if (!success) break;
				return [true, closeOthers(items, i, {
					...item,
					items: newItems
				})];
			}
			case "submenu": {
				if (item.id === id) {
					return [true, closeOthers(items, i, {
						...item,
						opened: true,
					})];
				} else {
					const { items: oldItems } = item;
					const [success, newItems] = openContextMenuSubmenu(oldItems, id);
					if (!success) break;
					return [true, closeOthers(items, i, {
						...item,
						items: newItems
					})]
				}
			}
		}
	}
	return [false, items];
}
const closeContextMenuSubmenu = <T extends ContextMenu.Item>(items: readonly T[], id: string):
	[success: boolean, items: readonly T[]] => {
	for (const [i, item] of items.entries()) {
		switch (item.type) {
			case "single": {
				break;
			}
			case "section": {
				const { items: oldItems } = item;
				const [success, newItems] = closeContextMenuSubmenu(oldItems, id);
				if (!success) break;
				return [true, items.with(i, {
					...item,
					items: newItems.map(closeItem)
				})];
			}
			case "submenu": {
				if (item.id === id) {
					return [true, items.with(i, closeItem(item))];
				} else {
					const { items: oldItems } = item;
					const [success, newItems] = closeContextMenuSubmenu(oldItems, id);
					if (!success) break;
					return [true, items.with(i, {
						...item,
						items: newItems.map(closeItem)
					})];
				}
			}
		}
	}
	return [false, items];
}
const closeItem = <T extends ContextMenu.Item>(item: T): T => {
	switch (item.type) {
		case "single": {
			return item;
		}
		case "section": {
			const { items } = item;
			return {
				...item,
				items: items.map(closeItem),
			};
		}
		case "submenu": {
			const { items } = item;
			return {
				...item,
				opened: false,
				items: items.map(closeItem),
			};
		}
	}
}
const closeOthers = <T extends ContextMenu.Item>(items: readonly T[], i: number, open: T) =>
	items.map((item, j) => (
		j === i
			? open
			: item.type === "submenu" && item.opened
				? closeItem(item)
				: item
	));


export const mergeContextMenuItems = <T extends ContextMenu.Item>(
	dest: readonly T[],
	src: readonly T[],
): T[] => {
	return [...src.reduce((acc, item): T[] => {
		switch (item.type) {
			case "single": {
				const { id } = item;
				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.SingleItem & T] => v[1].type === "single" && v[1].id === id);
				if (!match) {
					return [...acc, item];
				}
				const [index] = match;
				return acc.with(index, item);
			}
			case "section": {
				const { id, items } = item;

				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.Section & T] => v[1].type === "section" && v[1].id === id);
				if (!match) {
					return [...acc, item];
				}
				const [index, other] = match;
				return acc.with(index, {
					...other,
					items: mergeContextMenuItems(other.items, items)
				});
			}
			case "submenu": {
				const { id, items } = item;

				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.Submenu & T] => v[1].type === "submenu" && v[1].id === id);
				if (!match) {
					return [...acc, item];
				}
				const [index, other] = match;

				return acc.with(index, {
					...other,
					items: mergeContextMenuItems(other.items, items),
				} satisfies ContextMenu.Submenu & T);
			}
		}
	}, dest)];
}