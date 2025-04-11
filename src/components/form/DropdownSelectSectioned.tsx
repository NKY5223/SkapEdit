import { Dispatch, KeyboardEventHandler, ReactNode, SetStateAction, useRef, useState } from "react";
import css from "./DropdownSelectSectioned.module.css";
import { classList } from "../utils.tsx";
import { Option } from "./DropdownSelect.tsx";
import { useClickOutside } from "../../hooks/useClickOutside.ts";

export type SectionedOptions<T> = {
	name: string;
	label: ReactNode;
	options: Option<T>[];
}[];
type DropdownSelectSectionedProps<T> = {
	options: SectionedOptions<T>;
	initial: T;
	fallback?: ReactNode;

	onSelect?: (value: T) => void;

	selectClass?: string;
	optionsClass?: string;
	optionClass?: string;
};
export function DropdownSelectSectioned<T>({
	options: sections, initial, fallback,
	onSelect,
	selectClass, optionsClass, optionClass,
}: DropdownSelectSectionedProps<T>): ReactNode {
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
	
	return (
		<div ref={selectRef} className={className} role="input"
			onKeyDown={filterKeys(() => setOpen(false), ["Escape"])}
		>
			<div className={css["current"]} tabIndex={0}
				onClick={toggleOpen} onKeyDown={filterKeys(toggleOpen)}
			>
				{selectedOption?.display(true) ?? fallback}
			</div>
			<ul className={optionsClassName}>
				{sectionComps}
			</ul>
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
		value, display,
	},
	optionClass,
	selection, setSelection,
	onSelect,
}: OptionProps<T>) {
	const onTrigger = () => {
		setSelection(value);
		if (onSelect) onSelect(value);
	};
	const className = classList(
		css["option"],
		Object.is(selection, value) ? css["selected"] : null,
		optionClass,
	);
	return (
		<li className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{display(false)}
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
