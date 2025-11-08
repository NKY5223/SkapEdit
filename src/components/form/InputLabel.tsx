import { FC, ReactNode } from "react";
import css from "./form.module.css";
import { toClassName } from "@components/utils.tsx";

type InputLabelProps = {
	for: string;
	children: [
		label: ReactNode,
		input: ReactNode,
	];
	classList?: string[];
};

export const InputLabel: FC<InputLabelProps> = ({
	for: htmlFor,
	children: [label, input],
	classList,
}) => {
	const className = toClassName(
		css["label"],
		classList,
	);
	return (
		<label className={className} htmlFor={htmlFor}>
			{label && (<div className={css["label-content"]}>{label}</div>)}
			{input}
		</label>
	);
}