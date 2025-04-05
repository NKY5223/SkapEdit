import { classList } from "@components/utils.tsx";
import { useClickOutside } from "@hooks/clickOutside.ts";
import { FC, useRef } from "react";
import css from "./ContextMenu.module.css";
import { useClearContextMenu } from "./hook.tsx";
import { ContextMenuItem } from "./item/Item.tsx";
import { useKeydown } from "@hooks/keydown.ts";
import { ContextMenuAnchored } from "./ContextMenu.tsx";

export const contextMenuAnchorClassName = css["anchor"];

type AnchoredContextMenuProps = {
	contextMenu: ContextMenuAnchored;
	dismiss?: boolean;
};
export const AnchoredContextMenu: FC<AnchoredContextMenuProps> = ({
	contextMenu,
	dismiss = true,
}) => {
	const { content: { items } } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const className = classList(
		css["context-menu"],
		css["anchored"],
	);

	if (dismiss) {
		useClickOutside(menuRef, clear);
		useKeydown(["Escape"], clear);
	}

	return (
		<menu ref={menuRef} className={className}>
			{items.map(item => (
				<ContextMenuItem key={item.id} item={item} />
			))}
		</menu>
	);
}