import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { ContextMenuItem } from "./Item.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { classList } from "@components/utils.tsx";

type ContextMenuSectionProps = {
	item: ContextMenu.Section;
};
export const ContextMenuSection: FC<ContextMenuSectionProps> = ({
	item
}) => {
	const { name, icon, items } = item;
	const nameClassName = classList(
		css["name"],
		icon && css["has-icon"],
	);
	return (
		<li className={css["section"]}>
			{name &&
				<div className={nameClassName}>
					{icon && <Icon icon={icon} size={0.75 * 1.5} />}
					<Translate k="contextmenu.item.name" name={name} />
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