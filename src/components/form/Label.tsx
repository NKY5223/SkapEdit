import { FC, ReactNode } from "react";
import css from "./form.module.css";

type LabelProps = {
	for: string;
	children: [
		label: ReactNode,
		input: ReactNode,
	];
};

export const Label: FC<LabelProps> = ({
	for: htmlFor,
	children: [label, input],
}) => {
	return (
		<label className={css.label} htmlFor={htmlFor}>
			{label && (<div className={css["label-content"]}>{label}</div>)}
			{input}
		</label>
	);
}