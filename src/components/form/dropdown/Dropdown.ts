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