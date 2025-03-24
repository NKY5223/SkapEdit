import { Dispatch, KeyboardEventHandler, ReactNode, SetStateAction, useState } from "react";
import css from "./DropdownSelectSectioned.module.css";
import { classList } from "../utils.tsx";
import { type Option } from "./DropdownSelectList.tsx";

export type Options<T> = {
	name: string;
	label: ReactNode;
	options: Option<T>[];
}[];
type DropdownSelectSectionedProps<T> = {
	options: Options<T>;
	initial: T;

	onSelect?: (value: T) => void;

	selectedClass?: string;
	optionClass?: string;
};
export function DropdownSelectSectioned<T>({
	options: sections, initial,
	onSelect,
	selectedClass, optionClass,
}: DropdownSelectSectionedProps<T>): ReactNode {
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<T>(initial);
	const toggleOpen = () => setOpen(v => !v);

	const sectionComps = sections.map(({ name, label, options }) => {
		const optionComps = options.map((option) => (
			<Option key={option.name} {...{
				option,
				optionClass,
				selection,
				setSelection,
				onSelect,
			}} />
		));

		return (
			<div key={name} className={css["section"]}>
				<div className={css["label"]}>{label}</div>
				{optionComps}
			</div>
		);
	});
	const className = classList(
		css["select"],
		open ? css["open"] : null,
		selectedClass,
	);
	const fallbackSelection = "<Select something>";
	const selectedOption = sections
		.flatMap(section => section.options)
		.find(option => option.value === selection);
	return (
		<div className={className} role="input"
			onKeyDown={filterKeys(() => setOpen(false), ["Escape"])}
		>
			<div className={css["current"]} tabIndex={0}
				onClick={toggleOpen} onKeyDown={filterKeys(toggleOpen)}
			>
				{selectedOption?.display(true) ?? fallbackSelection}
			</div>
			<div className={css["options"]}>
				{sectionComps}
			</div>
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
export function Option<T>({
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
		<div className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{display(false)}
		</div>
	);
}

function filterKeys(f: KeyboardEventHandler, keys = ["Enter", "Space"]): KeyboardEventHandler {
	return e => {
		if (keys.includes(e.code)) {
			f(e);
		}
	};
}
