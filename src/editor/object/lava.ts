import { Bounds } from "@editor/bounds.ts";
import { BaseObject, boundsObjectProperties } from "@editor/object/Base";

export type SkapLava = BaseObject<"lava", {
	bounds: Bounds;
}>;
export const lavaProperties = boundsObjectProperties("lava", 5)