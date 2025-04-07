import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { classList } from "@components/utils.tsx";

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
};
export const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item
}) => {
	const { display, click } = item;
	const className = classList(
		css["item"],
		css["single"]
	);
	return (
		<li className={className} onClick={click}>
			{display}
		</li>
	);
}