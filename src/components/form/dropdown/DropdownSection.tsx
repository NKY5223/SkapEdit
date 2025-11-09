import { Icon } from "@components/icon/Icon.tsx";
import { toClassName } from "@components/utils.tsx";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { OptionSection } from "./Dropdown.ts";
import { DropdownOption } from "./DropdownOption.tsx";
import css from "./DropdownSelect.module.css";
import menuCss from "../../menu.module.css";

type DropdownSectionProps<T> = {
	section: OptionSection<T>;
	value: T;
	setValue: Dispatch<SetStateAction<T>>;
	onSelect: ((value: T) => void) | undefined;

	optionClassList?: string | string[];
};
export const DropdownSection = <T,>({
	section: {
		name, label, icon,
		options,
	},
	onSelect,

	value: selectedValue, setValue: setSelectedValue,
	optionClassList = [],
}: DropdownSectionProps<T>): ReactNode => {
	const optionComps = options.map((option) => (
		<DropdownOption key={option.name} {...{
			option,
			classList: [...optionClassList, css["sectioned-option"]],
			selectedValue,
			setSelectedValue,
			onSelect,
		}} />
	));

	return (
		<li key={name} className={menuCss["section"]}>
			<div className={toClassName(
				menuCss["label"],
				icon && menuCss["icon"],
			)}>
				{icon && <Icon icon={icon} />}
				<span>{label}</span>
			</div>
			<menu>
				{optionComps}
			</menu>
		</li>
	);
}