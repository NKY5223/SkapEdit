import { FC, ReactNode, useId, useState } from "react";
import css from "./form.module.css";
import { Label } from "./Label.tsx";
import { toClassName } from "../utils.tsx";


export type TextInputProps = {
	name?: string;
	/** *Content* of the label associated with this input */
	label?: ReactNode;
	disabled?: boolean;

	value: string;
	maxLength?: number;

	/** Fires whenever the value is edited */
	onInput?: (value: string) => void;
	/** Fires when the value is committed (Enter, blur) */
	onChange?: (value: string) => void;

	inputClass?: string;
};

export const TextInput: FC<TextInputProps> = ({
	name, label, disabled,
	value, maxLength,
	onInput, onChange,
	inputClass,
}) => {
	const id = useId();

	const [internal, setInternal] = useState(value);
	const [editing, setEditing] = useState(false);

	const className = toClassName(
		css["input"], css["text"], 
		inputClass
	);
	return (
		<Label for={id}>
			{label}
			<input id={id} type="text" className={className}
				value={editing ? internal : value}
				maxLength={maxLength}
				disabled={disabled}

				name={name}

				onChange={e => {
					const newValue = e.currentTarget.value;
					setInternal(newValue);
					if (onInput) onInput(newValue);
				}}
				onFocus={() => {
					setEditing(true);
					setInternal(value);
				}}
				onBlur={() => {
					setEditing(false);
					setInternal(value);
					if (onChange) onChange(internal);
				}}
				onKeyDown={e => {
					if (e.code !== "Enter") return;
					if (onChange) onChange(internal);
				}}
				onContextMenu={e => e.stopPropagation()}
			/>
		</Label>
	);
}