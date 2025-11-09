import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";

export type CardinalDirection = 
	| 0
	| 1
	| 2
	| 3;
export const CardinalDirection = {
	Down: 0,
	Left: 1,
	Up: 2,
	Right: 3,
} as const;

export type SkapGravityZone = BaseObject<"gravityZone", {
	bounds: Bounds;
	direction: {
		type: "cardinal";
		direction: CardinalDirection;
	} | {
		type: "free";
		/** Direction, in degrees. 0 = down, 90 = left, etc. */
		direction: number;
	}
}>;

export const gravityZoneProperties = makeObjectProperties<SkapGravityZone>("gravityZone", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 5,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		affine: (obj, scale, translate) => ({
			...obj,
			bounds: obj.bounds.affine(scale, translate)
		}),
	},
});