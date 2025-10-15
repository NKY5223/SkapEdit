import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { classList } from "@components/utils.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { useClearContextMenu } from "../reducer.ts";
import { filterKeys } from "@components/form/DropdownSelect.tsx";

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
};
export const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item
}) => {
	const { name, icon, click } = item;
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
		<li className={className} onClick={handleClick} onKeyDown={filterKeys(handleClick)} tabIndex={0}>
			{icon && <Icon icon={icon} />}
			{name}
		</li>
	);
}