import { FC } from "react";
import { ContextMenu } from "../ContextMenu.tsx";
import { ContextMenuSection } from "./Section.tsx";
import { ContextMenuSingleItem } from "./Single.tsx";
import { ContextMenuSubmenu } from "./Submenu.tsx";

type ContextMenuItemProps = {
	item: ContextMenu.Item;
};
export const ContextMenuItem: FC<ContextMenuItemProps> = ({
	item
}) => {
	const { type } = item;
	switch (type) {
		case "single": {
			return <ContextMenuSingleItem item={item} />;
		}
		case "submenu": {
			return <ContextMenuSubmenu item={item} />;
		}
		case "section": {
			return <ContextMenuSection item={item} />;
		}
	}
}