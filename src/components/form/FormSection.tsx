import { FC, PropsWithChildren } from "react";
import css from "./form.module.css";
import { toClassName } from "@components/utils.tsx";

type FormSectionProps = {
	row?: boolean
};
export const FormSection: FC<PropsWithChildren<FormSectionProps>> = ({
	children,
	row
}) => {
	const classes = toClassName(
		css["form-section"],
		row && css["row"],
	);
	return (
		<div className={classes}>
			{children}
		</div>
	);
}