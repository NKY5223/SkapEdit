import { Icon } from "@components/icon/Icon.tsx";
import { filterKeys, toClassName } from "@components/utils.tsx";
import { Dispatch, ReactNode, SetStateAction } from "react";
import menuCss from "../../menu.module.css";
import { Option, selectedDep } from "./Dropdown.ts";
import css from "./DropdownSelect.module.css";

type DropdownOptionProps<T> = {
	option: Option<T>;
	classList?: string[];

	selectedValue: T;
	setSelectedValue: Dispatch<SetStateAction<T>>;

	onSelect: ((value: T) => void) | undefined;
};
export function DropdownOption<T>({
	option: {
		value, label: display, icon,
	},
	classList,
	selectedValue: selectedValue, setSelectedValue: setSelectedValue,
	onSelect,
}: DropdownOptionProps<T>): ReactNode {
	const onTrigger = () => {
		setSelectedValue(value);
		if (onSelect) onSelect(value);
	};
	const selected = Object.is(value, selectedValue);
	const className = toClassName(
		css["option"],
		menuCss["item"],
		icon && menuCss["icon"],
		selected && menuCss["active"],
		...classList ?? [],
	);
	const iconName = selectedDep(icon, false);
	return (
		<li className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{iconName && <Icon icon={iconName} />}
			<span className={menuCss["label"]}>
				{selectedDep(display, false)}
			</span>
		</li>
	);
}