import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeSimpleBoundsObjectProperties } from "@editor/object/Base";

export type SkapLava = BaseObject<"lava", {
	bounds: Bounds;
}>;
export const lavaProperties = makeSimpleBoundsObjectProperties("lava", 5)