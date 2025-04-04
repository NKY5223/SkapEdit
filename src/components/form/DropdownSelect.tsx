import { KeyboardEventHandler, ReactNode } from "react";

export type Option<T> = {
	name: string;
	value: T;
	display: (current: boolean) => ReactNode;
};export function filterKeys(f: KeyboardEventHandler, keys = ["Enter", "Space"]): KeyboardEventHandler {
	return e => {
		if (keys.includes(e.code)) {
			f(e);
		}
	};
}

