import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";
import { NewIcon } from "@components/icon/NewIcon.tsx";

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
};
export const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item
}) => {
	const { display, icon, click } = item;
	const className = classList(
		css["item"],
		css["single"],
		icon && css["has-icon"],
	);
	return (
		<li className={className} onClick={click}>
			{icon && <NewIcon icon={icon} />}
			{display}
		</li>
	);
}