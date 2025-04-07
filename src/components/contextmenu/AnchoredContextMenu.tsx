import { classList } from "@components/utils.tsx";
import { useClickOutside } from "@hooks/useClickOutside.ts";
import { FC, useRef } from "react";
import css from "./ContextMenu.module.css";
import { useClearContextMenu } from "./context.tsx";
import { ContextMenuItem } from "./item/Item.tsx";
import { useKeydown } from "@hooks/useKeydown.ts";
import { ContextMenu } from "./ContextMenu.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";

export const contextMenuAnchorClassName = css["anchor"];

type AnchoredContextMenuProps = {
	contextMenu: ContextMenu.Anchored;
	dismissable?: boolean;
};
export const AnchoredContextMenu: FC<AnchoredContextMenuProps> = ({
	contextMenu,
	dismissable = true,
}) => {
	const { items } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const className = classList(
		css["context-menu"],
		css["anchored"],
	);

	if (dismissable) {
		useClickOutside(menuRef, clear);
		useKeydown(["Escape"], clear);
	}

	return (
		<menu ref={menuRef} className={className}>
			<ErrorBoundary location="Context Menu" fallback={(_, orig) => (
				<div className={css["error"]}>{orig}</div>
			)}>
				{items.map(item => (
					<ContextMenuItem key={item.id} item={item} />
				))}
			</ErrorBoundary>
		</menu>
	);
}