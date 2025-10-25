import { FC, PropsWithChildren } from "react";
import css from "./form.module.css";

type FormTitleProps = {
	
};
export const FormTitle: FC<PropsWithChildren<FormTitleProps>> = ({
	children
}) => {
	return (
		<h3 className={css["title"]}>
			{children}
		</h3>
	)
}