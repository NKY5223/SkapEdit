import { Dispatch, ReactNode, SetStateAction, useRef, useState } from "react";
import css from "./DropdownSelectList.module.css";
import { classList } from "../utils.tsx";
import { filterKeys, Option } from "./DropdownSelect.tsx";
import { useClickOutside } from "../../hooks/useClickOutside.ts";
import { useKeydown } from "@hooks/useKeydown.ts";
import { Icon } from "@components/icon/Icon.tsx";

type DropdownSelectListProps<T> = {
	options: Option<T>[];
	initial: T;
	fallback?: ReactNode;

	onSelect?: (value: T) => void;

	selectedClass?: string;
	optionClass?: string;
};
export function DropdownSelectList<T>({
	options, initial,
	fallback,
	onSelect,
	selectedClass, optionClass,
}: DropdownSelectListProps<T>): ReactNode {
	const selectRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<T>(initial);
	const toggleOpen = () => setOpen(v => !v);

	const optionComps = options.map((option) => (
		<ListOption key={option.name} {...{
			option,
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
	
	const selectedOption = options.find(option => option.value === selection);

	useClickOutside(selectRef, open, () => setOpen(false));
	useKeydown(["Escape"], () => setOpen(false));
	return (
		<div ref={selectRef} className={className} role="input"
			onContextMenu={e => e.stopPropagation()}
		>
			<div className={css["current"]} tabIndex={0}
				onClick={toggleOpen} onKeyDown={filterKeys(toggleOpen)}
			>
				{selectedOption?.display(true) ?? fallback}
			</div>
			<div className={css["options"]}>
				{optionComps}
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
function ListOption<T>({
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
		selected && css["selected"],
		optionClass,
	);
	return (
		<div className={className} tabIndex={0}
			onClick={onTrigger} onKeyDown={filterKeys(onTrigger)}>
			{icon && <Icon icon={icon(false)} />}
			{display(false)}
		</div>
	);
}