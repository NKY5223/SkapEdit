import { IconName } from "@components/icon/IconName.ts";
import { ReactNode } from "react";

// Prevent union distributing
export type MaybeConst<I, O> = [O] extends [Function]
	? (value: I) => O
	: O | ((value: I) => O);

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

export function maybeConst<I, O>(f: MaybeConst<I, O>, value: I): O;
export function maybeConst<I, O>(f: MaybeConst<I, O> | undefined, value: I): O | undefined;
export function maybeConst<I, O>(f: MaybeConst<I, O> | undefined, value: I): O | undefined {
	if (f === undefined) return undefined;
	if (typeof f === "function") return f(value);
	// Typescript does not narrow the type of value properly here.
	// @ts-expect-error
	return f;
};
