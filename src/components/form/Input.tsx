import { PropsWithChildren, useState } from "react";
import css from "./Input.module.css";


type NumberInputProps = {
	icon?: string;
	disabled?: boolean;
	value: number;
	/** Fires whenever the value is edited (Any key) */
	onInput?: (value: number) => void;
	/** Fires when the value is committed (Enter, blur) */
	onChange?: (value: number) => void;
};

export function NumberInput({
	icon, disabled, value,
	onInput, onChange,
}: NumberInputProps) {
	const [internal, setInternal] = useState(String(value));
	const [editing, setEditing] = useState(false);

	const className = [css.input, css.number, icon && css.icon].filter(x => !!x).join(" ");
	return (
		<input type="number" className={className}
			value={editing ? internal : value} disabled={disabled}
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
	);
}