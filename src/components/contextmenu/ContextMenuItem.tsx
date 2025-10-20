import { FC } from "react";
import { ContextMenu } from "./ContextMenu.ts";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { toClassName, filterKeys } from "@components/utils.tsx";
import { AnchoredContextMenu } from "./AnchoredContextMenu.tsx";
import { useClearContextMenu } from "./reducer.ts";
import css from "./ContextMenu.module.css";
import menuCss from "../menu.module.css";

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


type ContextMenuSectionProps = {
	item: ContextMenu.Section;
};
const ContextMenuSection: FC<ContextMenuSectionProps> = ({
	item
}) => {
	const { name, icon, items } = item;
	const nameClassName = toClassName(
		menuCss["label"],
		css["name"],
		icon && css["has-icon"],
	);
	return (
		<li className={toClassName(
			menuCss["section"],
			css["section"],
		)}>
			{name &&
				<div className={nameClassName}>
					{icon && <Icon icon={icon} />}
					<Translate k="contextmenu.item.name" name={name} />
				</div>
			}
			<menu>
				{items.map(item =>
					<ContextMenuItem key={item.id} item={item} />
				)}
			</menu>
		</li>
	);
}

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
};
const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item: { name, icon, click }
}) => {
	const clear = useClearContextMenu();
	const handleClick = () => {
		click?.();
		clear();
	}
	return (
		<li className={toClassName(
			menuCss["item"],
			css["item"],
			css["single"],
			icon && css["has-icon"]
		)} onClick={handleClick} onKeyDown={filterKeys(handleClick)} tabIndex={0}>
			{icon && <Icon icon={icon} />}
			<Translate k="contextmenu.item.name" name={name} />
		</li>
	);
}

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
};
const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item: { name, items, icon },
}) => {
	return (
		<li className={toClassName(
			menuCss["item"],
			css["item"],
			css["submenu"]
		)} tabIndex={0}>
			<Translate k="contextmenu.item.name" name={name} />
			{icon && <Icon icon={icon} />}
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