import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { toClassName } from "@components/utils.tsx";
import { FC, useRef } from "react";
import css from "./ContextMenu.module.css";
import { clearContextMenuContext, ContextMenu } from "./ContextMenu.ts";
import { ContextMenuItem } from "./ContextMenuItem.tsx";
import menuCss from "../menu.module.css";

type AnchoredContextMenuProps = {
	items: ContextMenu.Anchored["items"];
	/** If is root, will use a popover for the context menu. */
	notRoot?: boolean;
	/** If is root, use this id for triggering it. */
	id?: string;
};
export const AnchoredContextMenu: FC<AnchoredContextMenuProps> = ({
	items,
	id,
	notRoot = false,
}) => {

	const menuRef = useRef<HTMLElement>(null);

	const className = toClassName(
		menuCss["menu"],
		css["context-menu"],
		css["anchored"],
		!notRoot && css["root"],
	);

	if (!notRoot) {
		return (
			<menu ref={menuRef} id={id} className={className} popover="auto">
				<ErrorBoundary location={`AnchoredContextMenu`} fallback={(_, orig) => (
					<div className={css["error"]}>{orig}</div>
				)}>
					<clearContextMenuContext.Provider value={() => {
						try {
							menuRef.current?.hidePopover();
						} catch (err) {
							console.error("Error hiding anchoredcontextmenu popover: ", err);
						}
					}}>
						{items.map(item => (
							<ContextMenuItem key={item.id} item={item} />
						))}
					</clearContextMenuContext.Provider>
				</ErrorBoundary>
			</menu>
		);
	}
	return (
		<menu ref={menuRef} id={id} className={className}>
			<ErrorBoundary location={`AnchoredContextMenu`} fallback={(_, orig) => (
				<div className={css["error"]}>{orig}</div>
			)}>
				{items.map(item => (
					<ContextMenuItem key={item.id} item={item} />
				))}
			</ErrorBoundary>
		</menu>
	);
	// if (items.length === 0) {
	// 	return null;
	// }
}