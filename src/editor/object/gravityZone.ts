import { mod } from "@common/number.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, CardinalDirection, makeObjectProperties } from "@editor/object/Base";

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

const toCardinalDirection = (dir: number): CardinalDirection => {
	if (dir === 0 || dir === 1 || dir === 2 || dir === 3) return dir;
	return 0;
}

export const convertGravityZoneDirection = (direction: SkapGravityZone["direction"], type: SkapGravityZone["direction"]["type"]):
	SkapGravityZone["direction"] => {
	if (direction.type === type) return direction;
	if (type === "cardinal") {
		return {
			type,
			direction: toCardinalDirection(mod(Math.round(direction.direction / 90), 4)),
		};
	}
	return {
		type,
		direction: direction.direction * 90
	};
}