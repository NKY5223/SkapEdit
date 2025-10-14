import { IconName } from "@components/icon/IconName.ts";
import { KeyboardEventHandler, ReactNode } from "react";

export type Option<T> = {
	name: string;
	value: T;
	display: (current: boolean) => ReactNode;
	icon?: (current: boolean) => IconName;
};

export function filterKeys(f: KeyboardEventHandler, keys = ["Enter", "Space"]): KeyboardEventHandler {
	return e => {
		if (keys.includes(e.code)) {
			f(e);
		}
	};
}