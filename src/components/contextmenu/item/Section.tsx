import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { ContextMenuItem } from "./Item.tsx";

type ContextMenuSectionProps = {
	item: ContextMenu.Section;
};
export const ContextMenuSection: FC<ContextMenuSectionProps> = ({
	item
}) => {
	const { name, items } = item;
	return (
		<li className={css["section"]}>
			{name &&
				<div className={css["name-wrapper"]}>
					<div className={css["name"]}>{name}</div>
				</div>
			}
			<ul>
				{items.map(item =>
					<ContextMenuItem key={item.id} item={item} />
				)}
			</ul>
		</li>
	);
}