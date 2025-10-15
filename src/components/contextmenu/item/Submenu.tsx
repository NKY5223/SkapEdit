import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { classList } from "@components/utils.tsx";
import { AnchoredContextMenu } from "../AnchoredContextMenu.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
};
export const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item,
}) => {
	const { name, items } = item;

	const className = classList(
		css["item"],
		css["submenu"],
	);

	return (
		<li className={className} tabIndex={0}>
			<Translate k="contextmenu.item.name" name={name} />
			<Icon icon="arrow_right" size={1} classList={[
				css["icon"]
			]} />
			<AnchoredContextMenu contextMenu={{
				type: "anchored",
				items,
			}} dismissable={false} />
		</li>
	);
}