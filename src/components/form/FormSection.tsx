import { toClassName } from "@components/utils.tsx";
import { FC, PropsWithChildren } from "react";
import css from "./form.module.css";

type FormSectionProps = {
	row?: boolean;
	gap?: number;
};
export const FormSection: FC<PropsWithChildren<FormSectionProps>> = ({
	children,
	row, gap,
}) => {
	const classes = toClassName(
		css["form-section"],
		row && css["row"],
	);
	return (
		<div className={classes} style={
			gap === undefined ? {} : {
				"--form-section-gap": `${gap}em`,
			}
		}>
			{children}
		</div>
	);
}