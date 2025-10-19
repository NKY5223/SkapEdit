import { FC } from "react";
import css from "../ContextMenu.module.css";
import { ContextMenu } from "../ContextMenu.ts";
import { ContextMenuItem } from "./Item.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { toClassName } from "@components/utils.tsx";

type ContextMenuSectionProps = {
	item: ContextMenu.Section;
};
export const ContextMenuSection: FC<ContextMenuSectionProps> = ({
	item
}) => {
	const { name, icon, items } = item;
	const nameClassName = toClassName(
		css["name"],
		icon && css["has-icon"],
	);
	return (
		<li className={css["section"]}>
			{name &&
				<div className={nameClassName}>
					{icon && <Icon icon={icon} />}
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