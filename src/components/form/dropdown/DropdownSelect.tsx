import { Icon } from "@components/icon/Icon.tsx";
import { IconName } from "@components/icon/icons.ts";
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
	value: T;
	onInput?: (value: T) => void;

	fallbackLabel?: ReactNode | ((value: T) => ReactNode);
	fallbackIcon?: IconName | ((value: T) => IconName);

	classList?: string | string[];
	optionsClassList?: string | string[];
	optionClassList?: string | string[];

	/** Disable options wrapping to next column. Can be desirable for list-type dropdowns. */
	nowrap?: boolean;
	/** Disable the arrow on the currently-selected-chip. */
	noarrow?: boolean;
};
export const DropdownSelect = <T,>({
	options, value,
	fallbackLabel, fallbackIcon,
	onInput,
	classList, optionsClassList, optionClassList,

	nowrap = false, noarrow = false,
}: DropdownSelectProps<T>): ReactNode => {
	const optionsId = `options-${useId()}`;

	const optionNodes = options.map(opt => "options" in opt
		? (<DropdownSection key={opt.name} section={opt}
			{...{ value, onInput, optionClassList }} />)
		: (<DropdownOption key={opt.name} option={opt} classList={optionClassList}
			{...{ value, onInput }} />)
	);

	const optionsFlat = options.flatMap(opt => "options" in opt ? opt.options : opt);

	const selectedOption = optionsFlat.find(opt => Object.is(opt.value, value));
	const currentSelectionLabel =
		maybeConst(selectedOption?.label, true) ??
		maybeConst(fallbackLabel, value);
	const currentSelectionIcon =
		maybeConst(selectedOption?.icon, true) ??
		maybeConst(fallbackIcon, value);

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
				{!noarrow && <>
					<Icon classList={[css["arrow"], css["arrow-opened"]]} icon="arrow_drop_down" />
					<Icon classList={[css["arrow"], css["arrow-closed"]]} icon="arrow_right" />
				</>}
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