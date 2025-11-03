import { toClassName } from "@components/utils.tsx";
import { FC } from "react";
import { ToastInfo, useDispatchToast } from "./context.ts";
import css from "./Toast.module.css";
import { Icon } from "@components/icon/Icon.tsx";

type ToastProps = {
	toast: ToastInfo;
};
export const Toast: FC<ToastProps> = ({
	toast: { type, id, content },
}) => {
	const dispatch = useDispatchToast();

	const close = () => {
		dispatch({
			type: "remove_toast",
			toastId: id,
		});
	}

	const className = toClassName(
		css["toast"],
		css[type]
	);
	return (
		<div className={className}>
			<div className={css["content"]}>{content}</div>
			<button className={css["close"]} onClick={close}><Icon icon="close" /></button>
		</div>
	);
}