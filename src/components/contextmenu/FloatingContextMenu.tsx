import { classList } from "@components/utils.tsx";
import { useClickOutside } from "@hooks/clickOutside.ts";
import { FC, useRef } from "react";
import css from "./ContextMenu.module.css";
import { ContextMenuFloating } from "./ContextMenu.tsx";
import { useClearContextMenu } from "./hook.tsx";
import { ContextMenuItem } from "./item/Item.tsx";
import { useKeydown } from "@hooks/keydown.ts";

type FloatingContextMenuProps = {
	contextMenu: ContextMenuFloating;
	dismissable?: boolean;
};
export const FloatingContextMenu: FC<FloatingContextMenuProps> = ({
	contextMenu,
	dismissable = true,
}) => {
	const { pos, content: { items } } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const [x, y] = pos;

	const className = classList(
		css["context-menu"],
		css["floating"],
	);

	if (dismissable) {
		useClickOutside(menuRef, clear);
		useKeydown(["Escape"], clear);
	}

	return (
		<div className={css["floating-anchor"]} style={{
				"--x": `${x}px`,
				"--y": `${y}px`,
			}}>
			<menu ref={menuRef} className={className}>
				{items.map(item => (
					<ContextMenuItem key={item.id} item={item} />
				))}
			</menu>
		</div>
	);
}