import { Icon } from "@components/icon/Icon.tsx";
import { toClassName, filterKeys } from "@components/utils.tsx";
import { Dispatch, ReactNode, SetStateAction } from "react";
import css from "./DropdownSelect.module.css";
import { Option, selectedDep } from "./Dropdown.ts";

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
		icon && css["icon"],
		selected && css["selected"],
		...classList ?? [],
	);
	const iconName = selectedDep(icon, false);
	return (
		<li className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{iconName && <Icon icon={iconName} />}
			<span className={css["label"]}>
				{selectedDep(display, false)}
			</span>
		</li>
	);
}