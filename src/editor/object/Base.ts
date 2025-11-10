import { ID } from "@common/uuid.ts";
import { Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";

export type BaseObject<T extends string, P> = {
	type: T;
	id: ID;
} & P;
export type SkapObjectProperties<T extends string, O extends BaseObject<T, {}>> = {
	type: T;
	bounds: (obj: O) => Bounds;
	selection: {
		zIndex: (obj: O) => number;
		/** Iff a click at pos would click on the object, return true */
		clickbox: (obj: O, pos: Vec2) => boolean;
	};
	transform: {
		/** 
		 * Apply an affine transformation onto an object:  
		 * Scale the object by `scale` centered on the origin, then
		 * translate the object by `translate`.
		 * 
		 * A point on the object should undergo `x ↦ x * s + t`.
		 */
		affine: (obj: O, scale: Vec2, translate: Vec2) => O;
	};
};

export const makeObjectProperties = <O extends BaseObject<string, {}>>(
	type: O["type"], properties: Omit<SkapObjectProperties<O["type"], O>, "type">): SkapObjectProperties<O["type"], O> =>
	({ type, ...properties });

/** ObjectProperties for simple bounds-type object */
export const makeSimpleBoundsObjectProperties = <O extends BaseObject<string, { bounds: Bounds }>>(
	type: O["type"],
	zIndex: number,
) => makeObjectProperties<O>(type, {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => zIndex,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		affine: (obj, scale, translate) => ({
			...obj,
			bounds: obj.bounds.affine(scale, translate)
		}),
	},
});
export type CardinalDirection = 0 |
	1 |
	2 |
	3;
export const CardinalDirection = {
	Down: 0,
	Left: 1,
	Up: 2,
	Right: 3,
	
	0: `down`,
	1: `left`,
	2: `up`,
	3: `right`,
} as const;