import { FC, PropsWithChildren } from "react";
import css from "./Toast.module.css";
import { Toast } from "./Toast.tsx";
import { BaseToastsProvider } from "./context.ts";

type ToastProviderProps = {

};
export const ToastProvider: FC<PropsWithChildren<ToastProviderProps>> = ({
	children
}) => {
	return (
		<BaseToastsProvider initialValue={[]}>{([toasts,]) => (<>
			{children}
			<div className={css["toasts"]}>
				{toasts.map(t => (
					<Toast key={t.id} toast={t} />
				))}
			</div>
		</>)}</BaseToastsProvider>
	);
}