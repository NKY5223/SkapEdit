import { Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";

export type BaseObject<T extends string, P> = {
	type: T;
	id: string;
} & P;
export type SkapObjectProperties<T extends string, O extends BaseObject<T, {}>> = {
	type: T;
	selection: {
		zIndex: (obj: O) => number;
		/** Iff a click at pos would click on the object, return true */
		clickbox: (obj: O, pos: Vec2) => boolean;
	};
	transform: {
		/** Translate an object by `diff` */
		translate: (obj: O, diff: Vec2) => O;
		/** Scale an object on both axes, centered on `center` by `scaleFactor` */
		scale: (obj: O, center: Vec2, scaleFactor: Vec2) => O;
	};
};

export const makeObjectProperties = <O extends BaseObject<string, {}>>(
	type: O["type"], properties: Omit<SkapObjectProperties<O["type"], O>, "type">): SkapObjectProperties<O["type"], O> =>
	({ type, ...properties });

/** ObjectProperties for simple bounds-type object */
export const boundsObjectProperties = <O extends BaseObject<string, { bounds: Bounds }>>(
	type: O["type"],
	zIndex: number
) => makeObjectProperties<O>(type, {
	selection: {
		zIndex: () => zIndex,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		translate: (obj, diff) => ({
			...obj,
			bounds: obj.bounds.translate(diff)
		}),
		scale: (obj, center, scale) => ({
			...obj,
			bounds: obj.bounds.scale(center, scale),
		}),
	},
});