import { FC, PropsWithChildren } from "react";
import css from "./form.module.css";

type FormSectionProps = {

};
export const FormSection: FC<PropsWithChildren<FormSectionProps>> = ({
	children,
}) => {
	return (
		<div className={css["form-section"]}>
			{children}
		</div>
	);
}