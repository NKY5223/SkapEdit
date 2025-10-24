import { Icon } from "@components/icon/Icon.tsx";
import { IconName } from "@components/icon/IconName.ts";
import { toClassName } from "@components/utils.tsx";
import { FC, ReactNode, useId, useState } from "react";
import { Option, OptionSection } from "./Dropdown.ts";
import { maybeConst } from "@common/maybeConst.ts";
import { DropdownOption } from "./DropdownOption.tsx";
import { DropdownSection } from "./DropdownSection.tsx";
import css from "./DropdownSelect.module.css";
import menuCss from "../../menu.module.css";

type DropdownSelectProps<T> = {
	options: readonly (Option<T> | OptionSection<T>)[];
	initialValue: T;

	fallbackLabel?: ReactNode | ((value: T) => ReactNode);
	fallbackIcon?: IconName | ((value: T) => IconName);

	onSelect?: (value: T) => void;

	classList?: string[];
	optionsClassList?: string[];
	optionClassList?: string[];

	/** Disable options wrapping to next column. Can be desirable for list-type dropdowns. */
	nowrap?: boolean;
};
export const DropdownSelect = <T,>({
	options, initialValue,
	fallbackLabel, fallbackIcon,
	onSelect,
	classList, optionsClassList, optionClassList,

	nowrap = false,
}: DropdownSelectProps<T>): ReactNode => {
	const optionsId = `options-${useId()}`;
	const [selectedValue, setSelectedValue] = useState(initialValue);

	const optionNodes = options.map(opt => "options" in opt
		? (<DropdownSection key={opt.name} section={opt} {...{ onSelect, selectedValue: selectedValue, setSelectedValue: setSelectedValue, optionClassList }} />)
		: (<DropdownOption key={opt.name} option={opt} classList={optionClassList} {...{ onSelect, selectedValue: selectedValue, setSelectedValue: setSelectedValue }} />)
	);

	const optionsFlat = options.flatMap(opt => "options" in opt ? opt.options : opt);

	const selectedOption = optionsFlat.find(opt => Object.is(opt.value, selectedValue));
	const currentSelectionLabel = 
		maybeConst(selectedOption?.label, true) ?? 
		maybeConst(fallbackLabel, selectedValue);
	const currentSelectionIcon = 
		maybeConst(selectedOption?.icon, true) ?? 
		maybeConst(fallbackIcon, selectedValue);

	return (
		<div className={toClassName(
			css["select"],
			classList,
		)} role="input">
			<button tabIndex={0} popoverTarget={optionsId} className={toClassName(
				css["current"],
				currentSelectionIcon && css["icon"],
			)}>
				{currentSelectionIcon && <Icon icon={currentSelectionIcon} />}
				<span className={css["label"]}>{currentSelectionLabel}</span>
				<Icon classList={[css["arrow"], css["arrow-opened"]]} icon="arrow_drop_down" />
				<Icon classList={[css["arrow"], css["arrow-closed"]]} icon="arrow_right" />
			</button>
			<menu id={optionsId} popover="auto" className={toClassName(
				css["options"],
				menuCss["menu"],
				nowrap && menuCss["nowrap"],
				optionsClassList,
			)}>
				{optionNodes}
			</menu>
		</div>
	)
}

// It is indeed a functional component
DropdownSelect satisfies FC<DropdownSelectProps<() => number>>