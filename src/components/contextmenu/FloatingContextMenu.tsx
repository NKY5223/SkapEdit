import { FC, MouseEventHandler, useEffect, useRef } from "react";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { toClassName } from "@components/utils.tsx";
import { ContextMenu } from "./ContextMenu.ts";
import { ContextMenuItem } from "./ContextMenuItem.tsx";
import css from "./ContextMenu.module.css";
import menuCss from "../menu.module.css";

type FloatingContextMenuProps = {
	contextMenu: ContextMenu.Floating;
	ref?: React.RefObject<HTMLDivElement | null>;
};
export const FloatingContextMenu: FC<FloatingContextMenuProps> = ({
	contextMenu,
	ref,
}) => {
	const { pos, items } = contextMenu;

	const menuRef = useRef<HTMLElement>(null);

	const [x, y] = pos;

	const className = toClassName(
		menuCss["menu"],
		menuCss["nowrap"],
		css["context-menu"],
		css["floating"],
	);

	useEffect(() => {
		const menu = menuRef.current;
		if (menu === null) return;

		menu.hidePopover();
		menu.showPopover();
	}, [menuRef.current, contextMenu]);

	const handleContextMenu: MouseEventHandler = e => { e.stopPropagation(); }

	return (
		<div ref={ref} className={css["floating-anchor"]} style={{
			"--x": `${x}px`,
			"--y": `${y}px`,
		}}>
			<menu ref={menuRef} className={className} popover="auto" onContextMenu={handleContextMenu}>
				<ErrorBoundary location={`FloatingContextMenu`} fallback={(_, orig) => (
					<div className={css["error"]}>
						{orig}
						<code>Context menu data: {JSON.stringify(contextMenu)}</code>
					</div>
				)}>
					{items.map(item => (
						<ContextMenuItem key={item.id} item={item} />
					))}
				</ErrorBoundary>
			</menu>
		</div>
	);
}