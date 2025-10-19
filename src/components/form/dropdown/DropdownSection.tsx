import { Dispatch, ReactNode, SetStateAction } from "react";
import css from "./DropdownSelect.module.css";
import { OptionSection } from "./Dropdown.ts";
import { DropdownOption } from "./DropdownOption.tsx";
import { Icon } from "@components/icon/Icon.tsx";
import { toClassName } from "@components/utils.tsx";

type DropdownSectionProps<T> = {
	section: OptionSection<T>;
	selectedValue: T;
	setSelectedValue: Dispatch<SetStateAction<T>>;
	onSelect: ((value: T) => void) | undefined;

	optionClassList?: string[];
};
export const DropdownSection = <T,>({
	section: {
		name, label, icon,
		options,
	},
	onSelect,

	selectedValue, setSelectedValue,
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
		<li key={name} className={css["section"]}>
			<div className={toClassName(
				css["label"],
				icon && css["icon"],
			)}>
				{icon && <Icon icon={icon} />}
				<span className="label-content">{label}</span>
			</div>
			<menu>
				{optionComps}
			</menu>
		</li>
	);
}