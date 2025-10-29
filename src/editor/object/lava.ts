import { Bounds } from "@editor/bounds.ts";
import { makeObjectProperties } from "@editor/map.ts";
import { BaseObject } from "@editor/object/Base";

export type SkapLava = BaseObject<"lava", {
	bounds: Bounds;
}>;
export const lavaProperties = makeObjectProperties("lava", {
	zIndex: () => 5,
	clickbox: (obj: SkapLava, pos) => obj.bounds.contains(pos),
});