import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";
import { NewIcon } from "@components/icon/NewIcon.tsx";
import { useClearContextMenu } from "../context.tsx";

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
};
export const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item
}) => {
	const { display, icon, click } = item;
	const clear = useClearContextMenu();
	const handleClick = () => {
		if (!click) return;
		click();
		clear();
	}
	const className = classList(
		css["item"],
		css["single"],
		icon && css["has-icon"],
	);
	return (
		<li className={className} onClick={handleClick}>
			{icon && <NewIcon icon={icon} />}
			{display}
		</li>
	);
}