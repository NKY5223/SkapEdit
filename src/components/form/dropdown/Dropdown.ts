import { IconName } from "@components/icon/IconName.ts";
import { ReactNode } from "react";

/** T should NOT be a function. If T is a function, selectedDep will fail. */
export type SelectedDep<T> = T | ((selected: boolean) => T);

export type Option<T> = {
	readonly name: string;
	readonly value: T;
	readonly label: SelectedDep<ReactNode>;
	readonly icon?: SelectedDep<IconName>;
};
export type OptionSection<T> = {
	readonly name: string;
	readonly label: ReactNode;
	readonly icon?: IconName;
	readonly options: readonly Option<T>[];
};

export function selectedDep<T,>(value: SelectedDep<T>, selected?: boolean): T;
export function selectedDep<T,>(value: SelectedDep<T> | undefined, selected?: boolean): T | undefined;
export function selectedDep<T,>(value: SelectedDep<T> | undefined, selected: boolean = false): T | undefined {
	if (value === undefined) return undefined;
	if (typeof value === "function") {
		return (value as (selected: boolean) => T)(selected);
	}
	return value as T;
}