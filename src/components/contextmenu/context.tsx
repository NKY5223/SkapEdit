import { createContext, Dispatch, FC, PropsWithChildren, useEffect, useContext, Reducer, useReducer } from "react";
import { ContextMenu } from "./ContextMenu.tsx";
import { FloatingContextMenu } from "./FloatingContextMenu.tsx";
import { Vec2, vec2 } from "@common/vec2.ts";
import { createId } from "@common/uuid.ts";

type RClickContextMenu = {
	id: string;
	openedIds: string[];
	menu: ContextMenu.Floating;
};

type ActionBase<T extends string, R> = {
	type: T;
} & R;
type ContextMenuAction = (
	| ActionBase<"open_submenu", {
		target: string;
	}>
	| ActionBase<"close_submenu", {
		target: string;
	}>
	| ActionBase<"set", {
		menu: {
			pos: Vec2;
			items: ContextMenu.Item[];
		} | null;
	}>
);
const cmenuReducerContext = createContext<Dispatch<ContextMenuAction>>(() => {
	console.error("Missing context menu reducer context.");
});
const cmenuReducer: Reducer<RClickContextMenu | null, ContextMenuAction> = (menu, action): RClickContextMenu | null => {
	switch (action.type) {
		case "set": {
			const src = action.menu;
			if (!src) {
				return null;
			}
			const id = createId("cmenu");
			const { pos, items } = src;
			return {
				id,
				openedIds: [],
				menu: {
					type: "floating",
					items,
					pos,
				}
			};
		}
		case "open_submenu": {
			if (menu === null) return menu;
			const ids = menu.openedIds;
			const id = action.target;
			return {
				...menu,
				openedIds: [
					...ids.filter(x => x !== id),
					id,
				],
			};
		}
		case "close_submenu": {
			if (menu === null) return menu;
			const ids = menu.openedIds;
			const id = action.target;
			return {
				...menu,
				openedIds: ids.filter(x => x !== id),
			};
		}
	}
}
export const useCmenuReducer = () => useContext(cmenuReducerContext);

const cmenuOpenedIdContext = createContext<string | null>(null);
export const useCmenuOpenedId = () => useContext(cmenuOpenedIdContext);

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const [current, dispatch] = useReducer(cmenuReducer, null);

	useEffect(() => {
		console.log("cmenu provider mount");
		return () => console.log("cmenu provider unmount");
	}, []);
	const openedId = current?.openedIds.at(-1) ?? null;

	return (
		<div data--provider-name="ContextMenuProvider" onContextMenuCapture={() => {
			dispatch({
				type: "set",
				menu: null,
			});
		}}>
			{/* I love context hell!!!! */}
			<cmenuOpenedIdContext.Provider value={openedId}>
				<cmenuReducerContext.Provider value={dispatch}>
					{children}
					{current && <FloatingContextMenu key={current.id}
						contextMenu={current.menu}
					/>}
				</cmenuReducerContext.Provider>
			</cmenuOpenedIdContext.Provider>
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
			type: "set",
			menu: {
				pos: vec2(event.clientX, event.clientY),
				items,
			},
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

export const mergeContextMenuItems = <T extends ContextMenu.Item>(
	dest: readonly T[],
	src: readonly T[],
): T[] => {
	return [...src.reduce((acc, item): T[] => {
		switch (item.type) {
			case "single": {
				const { name } = item;
				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.SingleItem & T] => v[1].type === "single" && v[1].name === name);
				if (!match) {
					return [...acc, item];
				}
				const [index] = match;
				return acc.with(index, item);
			}
			case "section": {
				const { name, items } = item;

				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.Section & T] => v[1].type === "section" && v[1].name === name);
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
				const { name, items } = item;

				const match = acc
					.map((v, i) => [i, v] as const)
					.find((v): v is [number, ContextMenu.Submenu & T] => v[1].type === "submenu" && v[1].name === name);
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
/**
 * Checks if `item` contains, or is, an item with id `id`.
 */
export const contains = (item: ContextMenu.Item, id: string): boolean => {
	if (item.id === id) return true;
	switch (item.type) {
		case "single": {
			return false;
		}
		case "section":
		case "submenu": {
			return item.items.some(it => contains(it, id));
		}
	}
}