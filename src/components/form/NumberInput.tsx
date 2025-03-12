import { ReactNode, useId, useState } from "react";
import css from "./form.module.css";


type NumberInputProps = {
	name?: string;
	/** *Content* of the label associated with this input */
	label?: ReactNode;
	disabled?: boolean;

	value: number;
	min?: number;
	max?: number;
	step?: number;

	/** Fires whenever the value is edited */
	onInput?: (value: number) => void;
	/** Fires when the value is committed (Enter, blur) */
	onChange?: (value: number) => void;
};

export function NumberInput({
	name, label, disabled,
	value, min, max, step,
	onInput, onChange,
}: NumberInputProps) {
	const id = useId();

	const [internal, setInternal] = useState(String(value));
	const [editing, setEditing] = useState(false);

	const className = [css.input, css.number].filter(x => !!x).join(" ");
	return (
		<label className={css.label} htmlFor={id}>
			{label && (<div className={css["label-content"]}>{label}</div>)}
			<input id={id} type="number" className={className}
				value={editing ? internal : value} 
				min={min} max={max} step={step}
				disabled={disabled}

				name={name}

				onChange={e => {
					const newValue = e.currentTarget.value;
					setInternal(newValue);
					if (onInput) onInput(+newValue);
				}}
				onFocus={e => {
					setEditing(true);
					setInternal(String(value));
				}}
				onBlur={e => {
					setEditing(false);
					setInternal(String(value));
					if (onChange) onChange(+internal);
				}}
				onKeyDown={e => {
					if (e.code !== "Enter") return;
					if (onChange) onChange(+internal);
				}}
			/>
		</label>
	);
}

export function useNumberInput(initialValue: number, props: Omit<NumberInputProps, "value"> = {}) {
	const [value, setValue] = useState(initialValue);
	const actualProps: NumberInputProps = {
		...props,
		value,
		onInput: setValue,
	};
	const input = <NumberInput {...actualProps} />;

	return [value, input, setValue] as const;
}