import { FC, ReactNode, useId, useState } from "react";
import css from "./form.module.css";
import { InputLabel } from "./InputLabel.tsx";
import { toClassName } from "../utils.tsx";


export type CheckboxInputProps = {
	name?: string;
	/** *Content* of the label associated with this input */
	label?: ReactNode;
	disabled?: boolean;

	value: boolean;

	/** Fires whenever the value is edited */
	onInput?: (value: boolean) => void;

	inputClassList?: string | string[];
};

export const CheckboxInput: FC<CheckboxInputProps> = ({
	name, label, disabled,
	value,
	onInput,
	inputClassList,
}) => {
	const id = useId();

	const className = toClassName(
		css["input"], css["text"], 
		inputClassList
	);
	return (
		<InputLabel for={id}>
			{label}
			<input id={id} type="checkbox" className={className}
				checked={value}
				disabled={disabled}

				name={name}

				onChange={e => {
					onInput?.(e.currentTarget.checked);
				}}
			/>
		</InputLabel>
	);
}