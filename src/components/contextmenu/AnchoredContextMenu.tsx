import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { toClassName } from "@components/utils.tsx";
import { useClickOutside } from "@hooks/useClickOutside.ts";
import { useKeydown } from "@hooks/useKeydown.ts";
import { FC, useRef } from "react";
import css from "./ContextMenu.module.css";
import { ContextMenu } from "./ContextMenu.ts";
import { ContextMenuItem } from "./ContextMenuItem.tsx";
import { useClearContextMenu } from "./reducer.ts";
import menuCss from "../menu.module.css";

type AnchoredContextMenuProps = {
	contextMenu: ContextMenu.Anchored;
	open?: boolean;
	dismissable?: boolean;
};
export const AnchoredContextMenu: FC<AnchoredContextMenuProps> = ({
	contextMenu,
	open = true,
	dismissable = true,
}) => {
	const { items } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const className = toClassName(
		menuCss["menu"],
		css["context-menu"],
		css["anchored"],
		open && css["open"],
	);

	if (dismissable) {
		useClickOutside(menuRef, open, clear);
		useKeydown(["Escape"], clear);
	}

	return (
		<menu ref={menuRef} className={className}>
			<ErrorBoundary location={`AnchoredContextMenu`} fallback={(_, orig) => (
				<div className={css["error"]}>{orig}</div>
			)}>
				{items.map(item => (
					<ContextMenuItem key={item.id} item={item} />
				))}
			</ErrorBoundary>
		</menu>
	);
}