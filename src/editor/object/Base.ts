import { Vec2 } from "@common/vec2.ts";

// #region types

export type BaseObject<T extends string, P> = {
	type: T;
	id: string;
} & P;
export type SkapObjectProperties<T extends string, O extends BaseObject<T, {}>> = {
	type: T;
	zIndex: (obj: O) => number;
	/** Iff a click at pos would click on the object, return true */
	clickbox: (obj: O, pos: Vec2) => boolean;
};
