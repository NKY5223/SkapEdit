import { FC } from "react";

export const classList = (...list: (string | undefined | null | false)[]) => list.filter(s => !!s).join(" ");

export type ExtensibleFC<T> = FC<T & {
	classes?: string[];
}>;