import { IconName } from "@components/icon/IconName.ts";
import { ReactNode } from "react";

// If O is a function, it should be wrapped in `() =>`. 
export type MaybeConst<I, O> =
	| ((value: I) => O)
	| Exclude<O, Function>;


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
	// Type 'Exclude<O, Function> & Function' has no call signatures.
	// mfw typescript doesn't realise Exclude<A, B> & B = never
	// @ts-expect-error
	if (typeof f === "function") return f(value);
	return f;
};
