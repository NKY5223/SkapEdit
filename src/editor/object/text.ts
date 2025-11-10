import { Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";

export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;

export const textRadius = 5;
export const textProperties = makeObjectProperties<SkapText>("text", {
	bounds: obj => new Bounds({ topLeft: obj.pos, bottomRight: obj.pos }),
	transform: {
		affine: (obj, scale, translate) => ({ ...obj, pos: obj.pos.mul(scale).add(translate) }),
	},
	selection: {
		zIndex: () => 22,
		clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= textRadius,
	},
});