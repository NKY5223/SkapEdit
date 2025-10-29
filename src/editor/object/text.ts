import { Vec2 } from "@common/vec2.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";

export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;
export const textProperties = makeObjectProperties<SkapText>("text", {
	transform: {
		translate: (obj, diff) => ({ ...obj, pos: obj.pos.add(diff) }),
		scale: (obj, center, scale) => ({ ...obj, pos: obj.pos.sub(center).mul(scale).add(center) })
	},
	selection: {
		zIndex: () => 10,
		clickbox: (obj, pos) => obj.pos.sub(pos).mag() <= 5,
	},
});