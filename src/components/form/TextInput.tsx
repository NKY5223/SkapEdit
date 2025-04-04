import { ReactNode, useId, useState } from "react";
import css from "./form.module.css";
import { Label } from "./Label.tsx";
import { classList } from "../utils.tsx";


type TextInputProps = {
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

export function TextInput({
	name, label, disabled,
	value, maxLength,
	onInput, onChange,
	inputClass,
}: TextInputProps) {
	const id = useId();

	const [internal, setInternal] = useState(value);
	const [editing, setEditing] = useState(false);

	const className = classList(
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
				onFocus={e => {
					setEditing(true);
					setInternal(value);
				}}
				onBlur={e => {
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

export function useTextInput(initialValue: string, props: Omit<TextInputProps, "value"> = {}) {
	const [value, setValue] = useState(initialValue);
	const actualProps: TextInputProps = {
		...props,
		value,
		onInput: setValue,
	};
	const input = <TextInput {...actualProps} />;

	return [value, input, setValue] as const;
}