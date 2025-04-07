import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.tsx";
import { ContextMenuItem } from "./Item.tsx";

type ContextMenuSectionProps = {
	item: ContextMenu.Section;
};
export const ContextMenuSection: FC<ContextMenuSectionProps> = ({
	item
}) => {
	const { title, items } = item;
	return (
		<li className={css["section"]}>
			{title &&
				<div className={css["title-wrapper"]}>
					<div className={css["title"]}>{title}</div>
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