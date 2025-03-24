import { Dispatch, KeyboardEventHandler, ReactNode, SetStateAction, useState } from "react";
import css from "./DropdownSelectList.module.css";
import { classList } from "../utils.tsx";

export type Option<T> = {
	name: string;
	value: T;
	display: (current: boolean) => ReactNode;
};
type Options<T> = Option<T>[];
type DropdownSelectListProps<T> = {
	options: Options<T>;
	initial: T;

	onSelect?: (value: T) => void;

	selectedClass?: string;
	optionClass?: string;
};
export function DropdownSelectList<T>({
	options, initial,
	onSelect,
	selectedClass, optionClass,
}: DropdownSelectListProps<T>): ReactNode {
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<T>(initial);
	const toggleOpen = () => setOpen(v => !v);

	const optionComps = options.map((option) => (
		<Option key={option.name} {...{
			option,
			optionBaseClass: css["option"],
			optionClass,
			selection, setSelection,
			onSelect,
		}} />
	));
	const className = classList(
		css["select"],
		open ? css["open"] : null,
		selectedClass,
	);
	const fallbackSelection = "<Select something>";
	const selectedOption = options.find(option => option.value === selection);
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
				{optionComps}
			</div>
		</div>
	);
}

type OptionProps<T> = {
	option: Option<T>;
	optionBaseClass: string | undefined;
	optionClass: string | undefined;
	selection: T;
	setSelection: Dispatch<SetStateAction<T>>;

	onSelect: ((value: T) => void) | undefined;
};
export function Option<T>({
	option: {
		value, display,
	},
	optionBaseClass,
	optionClass,
	selection, setSelection,
	onSelect,
}: OptionProps<T>) {
	const onTrigger = () => {
		setSelection(value);
		if (onSelect) onSelect(value);
	};
	const className = classList(
		optionBaseClass,
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
