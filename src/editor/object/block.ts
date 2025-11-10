import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";

export type SkapBlock = BaseObject<"block", {
	bounds: Bounds;
	color: Color;
	layer: 0 | 1;
	solid: boolean;
}>;

export const blockProperties = makeObjectProperties<SkapBlock>("block", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: obj => obj.layer === 0 ? 11 : 23,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		affine: (obj, scale, translate) => ({
			...obj,
			bounds: obj.bounds.affine(scale, translate)
		}),
	},
});