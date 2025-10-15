import { FC, useRef } from "react";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { classList } from "@components/utils.tsx";
import { useClickOutside } from "@hooks/useClickOutside.ts";
import { useKeydown } from "@hooks/useKeydown.ts";
import { ContextMenu } from "./ContextMenu.ts";
import { useClearContextMenu } from "./reducer.ts";
import { ContextMenuItem } from "./item/Item.tsx";
import css from "./ContextMenu.module.css";

type FloatingContextMenuProps = {
	contextMenu: ContextMenu.Floating;
	open?: boolean;
	dismissable?: boolean;
};
export const FloatingContextMenu: FC<FloatingContextMenuProps> = ({
	contextMenu,
	open = true,
	dismissable = true,
}) => {
	const { pos, items } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);
	const clear = useClearContextMenu();

	const [x, y] = pos;

	const className = classList(
		css["context-menu"],
		css["floating"],
		open && css["open"],
	);

	if (dismissable) {
		useClickOutside(menuRef, open, clear);
		useKeydown(["Escape"], clear);
	}

	return (
		<div className={css["floating-anchor"]} style={{
			"--x": `${x}px`,
			"--y": `${y}px`,
		}}>
			<menu ref={menuRef} className={className}>
				<ErrorBoundary location={`FloatingContextMenu`} fallback={(_, orig) => (
					<div className={css["error"]}>{orig}</div>
				)}>
					{items.map(item => (
						<ContextMenuItem key={item.id} item={item} />
					))}
				</ErrorBoundary>
			</menu>
		</div>
	);
}