import { MaybeConst } from "@common/maybeConst.ts";
import { IconName } from "@components/icon/icons";
import { ReactNode } from "react";

export type Option<T> = {
	/** Should be unique. */
	readonly name: string;
	readonly value: T;
	readonly label: MaybeConst<boolean, ReactNode>;
	readonly icon?: MaybeConst<boolean, IconName>;
};
export type OptionSection<T> = {
	/** Should be unique. */
	readonly name: string;
	readonly label: ReactNode;
	readonly icon?: IconName;
	readonly options: readonly Option<T>[];
};

export const makeOption = <T>(name: string, value: T, label: MaybeConst<boolean, ReactNode>, icon?: MaybeConst<boolean, IconName>): Option<T> => ({
	name,
	value,
	label,
	icon,
});

export const makeOptionSection = <T>(name: string, label: ReactNode, icon: IconName | null, options: readonly Option<T>[]): OptionSection<T> => ({
	name,
	label,
	icon: icon ?? undefined,
	options,
});