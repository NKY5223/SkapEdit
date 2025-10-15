import { Dispatch, KeyboardEventHandler, ReactNode, SetStateAction, useRef, useState } from "react";
import css from "./DropdownSelectSectioned.module.css";
import { classList } from "../utils.tsx";
import { Option } from "./DropdownSelect.tsx";
import { useClickOutside } from "../../hooks/useClickOutside.ts";
import { Icon } from "@components/icon/Icon.tsx";
import { IconName } from "@components/icon/IconName.ts";

export type SectionedOptions<T> = {
	name: string;
	label: ReactNode;
	options: Option<T>[];
}[];
type DropdownSelectSectionedProps<T> = {
	options: SectionedOptions<T>;
	initial: T;
	fallback?: ReactNode;
	fallbackIcon?: IconName;

	onSelect?: (value: T) => void;

	selectClass?: string;
	optionsClass?: string;
	optionClass?: string;
};
export const DropdownSelectSectioned = <T extends unknown>(props: DropdownSelectSectionedProps<T>) => {
	const {
		options: sections, initial, fallback, fallbackIcon,
		onSelect,
		selectClass, optionsClass, optionClass,
	} = props;

	const selectRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<T>(initial);
	const toggleOpen = () => setOpen(v => !v);

	const sectionComps = sections.map(({ name, label, options }) => {
		const optionComps = options.map((option) => (
			<SectionedOption key={option.name} {...{
				option,
				optionClass,
				selection,
				setSelection,
				onSelect,
			}} />
		));

		return (
			<li key={name} className={css["section"]}>
				<div className={css["label"]}>{label}</div>
				<ul>
					{optionComps}
				</ul>
			</li>
		);
	});
	const className = classList(
		css["select"],
		open ? css["open"] : null,
		selectClass,
	);
	const optionsClassName = classList(
		css["options"],
		optionsClass,
	);
	const selectedOption = sections
		.flatMap(section => section.options)
		.find(option => option.value === selection);

	useClickOutside(selectRef, open, () => setOpen(false));

	const icon = selectedOption ? selectedOption.icon?.(true) : fallbackIcon;
	const currentClassName = classList(
		css["current"],
		icon && css["icon"],
	);

	return (
		<div ref={selectRef} className={className} role="input"
			onKeyDown={filterKeys(() => setOpen(false), ["Escape"])}
		>
			<div className={css["anchor"]}></div>
			<div className={currentClassName} tabIndex={0}
				onClick={toggleOpen} onKeyDown={filterKeys(toggleOpen)}
			>
				{icon && <Icon icon={icon} />}
				<span className={css["display"]}>{selectedOption?.display(true) ?? fallback}</span>
				{open ? <Icon icon="arrow_drop_down" /> : <Icon icon="arrow_right" />}
			</div>
			<menu className={optionsClassName}>
				{sectionComps}
			</menu>
		</div>
	);
}

type OptionProps<T> = {
	option: Option<T>;
	optionClass: string | undefined;
	selection: T;
	setSelection: Dispatch<SetStateAction<T>>;

	onSelect: ((value: T) => void) | undefined;
};
export function SectionedOption<T>({
	option: {
		value, display, icon,
	},
	optionClass,
	selection, setSelection,
	onSelect,
}: OptionProps<T>) {
	const onTrigger = () => {
		setSelection(value);
		if (onSelect) onSelect(value);
	};
	const selected = Object.is(selection, value);
	const className = classList(
		css["option"],
		icon && css["icon"],
		selected && css["selected"],
		optionClass,
	);
	return (
		<li className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{icon && <Icon icon={icon(false)} />}
			<span className={css["display"]}>{display(false)}</span>
		</li>
	);
}

function filterKeys(f: KeyboardEventHandler, keys = ["Enter", "Space"]): KeyboardEventHandler {
	return e => {
		if (keys.includes(e.code)) {
			f(e);
		}
	};
}
