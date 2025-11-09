import { FC, ReactNode, useId, useState } from "react";
import css from "./form.module.css";
import { InputLabel } from "./InputLabel.tsx";
import { toClassName } from "../utils.tsx";


export type NumberInputProps = {
	name?: string;
	/** *Content* of the label associated with this input */
	label?: ReactNode;
	disabled?: boolean;

	value: number;
	min?: number;
	max?: number;
	step?: number;
	/** Will force the displayed value to have this many places via `.toFixed`. */
	places?: number;

	/** Fires whenever the value is edited */
	onInput?: (value: number) => void;
	/** Fires when the value is committed (Enter, blur) */
	onChange?: (value: number) => void;

	classList?: string | string[];
	labelClassList?: string | string[];
};

export const NumberInput: FC<NumberInputProps> = ({
	name, label, disabled,
	value, min, max, step, places,
	onInput, onChange,
	classList, labelClassList,
}) => {
	const id = useId();

	const [internal, setInternal] = useState(String(value));
	const [editing, setEditing] = useState(false);

	const className = toClassName(
		css["input"],
		css["number"],
		classList,
	);
	const fixedValue =
		places === undefined
			? value
			: value.toFixed(places);
	return (
		<InputLabel for={id} classList={labelClassList}>
			{label}
			<input id={id} type="number" className={className}
				value={editing
					? internal
					: fixedValue}
				min={min} max={max} step={step}
				disabled={disabled}

				name={name}

				onChange={e => {
					const newValue = e.currentTarget.value;
					setInternal(newValue);
					if (onInput) onInput(+newValue);
				}}
				onFocus={() => {
					setEditing(true);
					setInternal(String(fixedValue));
				}}
				onBlur={() => {
					setEditing(false);
					setInternal(String(fixedValue));
					if (onChange) onChange(+internal);
				}}
				onKeyDown={e => {
					if (e.code !== "Enter") return;
					if (onChange) onChange(+internal);
				}}
				onContextMenu={e => e.stopPropagation()}
			/>
		</InputLabel>
	);
}