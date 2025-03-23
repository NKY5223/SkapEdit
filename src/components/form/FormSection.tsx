import { FC, PropsWithChildren } from "react";
import css from "./form.module.css";

type FormSectionProps = {
	row?: boolean
};
export const FormSection: FC<PropsWithChildren<FormSectionProps>> = ({
	children,
	row
}) => {
	const classes = [
		css["form-section"],
		...(row ? [css["row"]] : [])
	];
	return (
		<div className={classes.join(" ")}>
			{children}
		</div>
	);
}