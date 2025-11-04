import { createId, ID } from "@common/uuid.ts";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { ReactNode, Reducer } from "react";

type ToastType = "info" | "error" | "warn" | "success";
export type ToastInfo = {
	type: ToastType;
	id: ID;
	content: ReactNode;
	duration?: number;
}
type ToastsAction = (
	| {
		type: "add_toast";
		toast: ToastInfo;
	}
	| {
		type: "remove_toast";
		toastId: ID;
	}
);

const toastsReducer: Reducer<readonly ToastInfo[], ToastsAction> = (toasts, action) => {
	switch (action.type) {
		case "add_toast": {
			return [...toasts, action.toast];
		}
		case "remove_toast": {
			return toasts.filter(t => t.id !== action.toastId);
		}
	}
}

export const [useToasts, useDispatchToast, BaseToastsProvider, useToastsWithDispatch] = createReducerContext("Toasts", toastsReducer);

/** Hook for creating toasts. */
export const useToast = () => {
	const dispatch = useDispatchToast();
	const createWithType = (type: ToastType) => (content: ReactNode, duration?: number) => dispatch({
		type: "add_toast",
		toast: {
			type, 
			id: createId("toast"),
			content,
			duration,
		}
	});
	return {
		info: createWithType("info"),
		error: createWithType("error"),
		warn: createWithType("warn"),
		success: createWithType("success"),
	};
}