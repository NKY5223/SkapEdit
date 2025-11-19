import { FC, KeyboardEvent, KeyboardEventHandler } from "react";
import { ContextMenu } from "./ContextMenu.ts";
import { Icon } from "@components/icon/Icon.tsx";
import { Translate } from "@components/translate/Translate.tsx";
import { toClassName, filterKeys } from "@components/utils.tsx";
import { AnchoredContextMenu } from "./AnchoredContextMenu.tsx";
import { useClearContextMenu } from "./ContextMenu.ts";
import css from "./ContextMenu.module.css";
import menuCss from "../menu.module.css";

type ContextMenuItemProps = {
	item: ContextMenu.Item;
	inSection?: boolean;
};
export const ContextMenuItem: FC<ContextMenuItemProps> = ({
	item,
	inSection = false,
}) => {
	const { type } = item;
	switch (type) {
		case "single": {
			return <ContextMenuSingleItem item={item} inSection={inSection} />;
		}
		case "submenu": {
			return <ContextMenuSubmenu item={item} inSection={inSection} />;
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
	item,
}) => {
	const { name, icon, items } = item;
	const nameClassName = toClassName(
		menuCss["label"],
		icon && menuCss["icon"],
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
					<ContextMenuItem key={item.id} item={item} inSection />
				)}
			</menu>
		</li>
	);
}

const handleKeyboard = (inSection: boolean, e: KeyboardEvent) => {
	e.stopPropagation();
	if (e.code === "ArrowDown") {
		const next = e.currentTarget.nextElementSibling;
		if (next === null) {
			if (inSection) {
				const next2 = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
				if (!(next2 instanceof HTMLElement)) return;
				if (next2.classList.contains(css["section"])) {
					const item = next2.lastElementChild?.firstElementChild;
					if (!(item instanceof HTMLElement)) return;
					item.focus();
					return;
				}
				next2.focus();
				return;
			}
		}
		if (next instanceof HTMLElement) {
			if (next.classList.contains(css["section"])) {
				const item = next.lastElementChild?.firstElementChild;
				if (!(item instanceof HTMLElement)) return;
				item.focus();
				return;
			}
			next.focus();
			return;
		}
	}
	if (e.code === "ArrowUp") {
		const prev = e.currentTarget.previousElementSibling;
		if (prev === null) {
			if (inSection) {
				const prev2 = e.currentTarget.parentElement?.parentElement?.previousElementSibling;
				if (!(prev2 instanceof HTMLElement)) return;
				if (prev2.classList.contains(css["section"])) {
					const item = prev2.lastElementChild?.lastElementChild;
					if (!(item instanceof HTMLElement)) return;
					item.focus();
					return;
				}
				prev2.focus();
				return;
			}
		}
		if (prev instanceof HTMLElement) {
			if (prev.classList.contains(css["section"])) {
				const item = prev.lastElementChild?.lastElementChild;
				if (!(item instanceof HTMLElement)) return;
				item.focus();
				return;
			}
			prev.focus();
			return;
		}
	}
}

type ContextMenuSingleItemProps = {
	item: ContextMenu.SingleItem;
	inSection?: boolean;
};
const ContextMenuSingleItem: FC<ContextMenuSingleItemProps> = ({
	item: { name, icon, click, closesMenu },
	inSection = false,
}) => {
	const clear = useClearContextMenu();
	const onClick = () => {
		click?.();
		if (closesMenu ?? true) clear();
	}
	const onKeyDown: KeyboardEventHandler = e => {
		filterKeys(onClick)(e);
		handleKeyboard(inSection, e);
	}
	return (
		<li className={toClassName(
			menuCss["item"],
			icon && menuCss["icon"],
			css["item"],
			css["single"],
		)} onClick={onClick} onKeyDown={onKeyDown} tabIndex={0}>
			{icon && <Icon icon={icon} />}
			<Translate k="contextmenu.item.name" name={name} />
		</li>
	);
}

type ContextMenuSubmenuProps = {
	item: ContextMenu.Submenu;
	inSection?: boolean;
};
const ContextMenuSubmenu: FC<ContextMenuSubmenuProps> = ({
	item: { name, items, icon },
	inSection = false,
}) => {
	const onKeyDown: KeyboardEventHandler = e => {
		handleKeyboard(inSection, e);
	}
	return (
		<li className={toClassName(
			menuCss["item"],
			icon && menuCss["icon"],
			css["item"],
			css["submenu"]
		)} tabIndex={0} onKeyDown={onKeyDown}>
			<div className={css["submenu-content"]}>
				{icon && <Icon icon={icon} />}
				<Translate k="contextmenu.item.name" name={name} />
			</div>
			<Icon icon="arrow_right" size={1} classList={[
				css["submenu-arrow"]
			]} />
			<AnchoredContextMenu items={items} notRoot />
		</li>
	);
}