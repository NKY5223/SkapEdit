import { toClassName } from "@components/utils.tsx";
import { FC, useEffect } from "react";
import { ToastInfo, useDispatchToast } from "./context.ts";
import css from "./Toast.module.css";
import { Icon } from "@components/icon/Icon.tsx";

type ToastProps = {
	toast: ToastInfo;
};
export const Toast: FC<ToastProps> = ({
	toast: { type, id, content, duration },
}) => {
	const dispatch = useDispatchToast();

	const close = () => {
		dispatch({
			type: "remove_toast",
			toastId: id,
		});
	}

	useEffect(() => {
		if (duration === undefined) return;
		
		const timeout = setTimeout(() => close(), duration * 1000);
		return () => {
			clearTimeout(timeout);
		}
	}, []);

	const timed = duration !== undefined;
	const className = toClassName(
		css["toast"],
		css[type],
		timed && css["timed"],
	);
	return (
		<div className={className}>
			<div className={css["content"]}>{content}</div>
			<button className={css["close"]} onClick={close}><Icon icon="close" /></button>
			{timed && <div className={css["timer"]} style={{ "--duration": `${duration}s` }} />}
		</div>
	);
}