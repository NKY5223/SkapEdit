import { createContext, Dispatch, FC, PointerEventHandler, PropsWithChildren, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from "react";
import css from "./ContextMenu.module.css";
import { vec2, Vec2 } from "../../common/vec2.ts";
import { classList } from "../utils.tsx";
import { useClickOutside } from "../../hooks/clickOutside.ts";

export type ContextMenuItem = {
	/** A (readable) string representing this item */
	id: string;
	/** Node to be inserted into the <li> */
	node: ReactNode;
	click?: () => void;
};
export type ContextMenu = {
	items: ContextMenuItem[];
	pos: Vec2;
};

type ContextMenuProps = {
	contextMenu: ContextMenu;
};
export const ContextMenu: FC<ContextMenuProps> = ({
	contextMenu: {
		items,
		pos
	}
}) => {
	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const [x, y] = pos;
	const w = window.innerWidth;
	const h = window.innerHeight;
	const onLeft = x > w - 160;
	const onTop = y > h - 32 * items.length;

	const className = classList(
		css["context-menu"],
		css[onLeft ? "left" : "right"],
		css[onTop ? "above" : "below"],
	);

	useClickOutside(menuRef, clear);

	return (
		<menu ref={menuRef} className={className} style={{
			"--x": `${onLeft ? w - x : x}px`,
			"--y": `${onTop ? h - y : y}px`,
		}}>
			{items.map(({ id, node, click }) => (
				<li key={id} className={css["item"]} onClick={click}>
					{node}
				</li>
			))}
		</menu>
	);
}

const contextMenuContext = createContext<
	Dispatch<SetStateAction<ContextMenu | null>>
>(() => { });
type UpdateContextMenu = Partial<ContextMenu>;

export const useContextMenu = (
	action: UpdateContextMenu | ((prev: ContextMenu | null) => UpdateContextMenu)
) => {
	const dispatch = useContext(contextMenuContext);
	return (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.preventDefault();
		dispatch(current => ({
			pos: vec2(event.clientX, event.clientY),
			items: [],
			...(typeof action === "function" ? action(current) : action),
		}));
	};
}
export const useClearContextMenu = () => {
	const dispatch = useContext(contextMenuContext);
	return () => dispatch(null);
}

export const ContextMenuProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const [current, setCurrent] = useState<ContextMenu | null>(null);
	return (
		<contextMenuContext.Provider value={setCurrent}>
			{children}
			{current && <ContextMenu contextMenu={current} />}
		</contextMenuContext.Provider>
	);
}

/*
Goal:
Extensible (how?) context menu, anchored at a parent
children should call the "create context menu" function
maybe children can be responsible for collecting the parents' context menus?
 */