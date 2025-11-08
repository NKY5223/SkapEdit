import { FC, ReactNode } from "react";
import css from "./form.module.css";

type InputLabelProps = {
	for: string;
	children: [
		label: ReactNode,
		input: ReactNode,
	];
};

export const InputLabel: FC<InputLabelProps> = ({
	for: htmlFor,
	children: [label, input],
}) => {
	return (
		<label className={css["label"]} htmlFor={htmlFor}>
			{label && (<div className={css["label-content"]}>{label}</div>)}
			{input}
		</label>
	);
}