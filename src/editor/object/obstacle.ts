import { Bounds } from "@editor/bounds.ts";
import { makeObjectProperties } from "@editor/map.ts";
import { BaseObject } from "@editor/object/Base";

export type SkapObstacle = BaseObject<"obstacle", {
	bounds: Bounds;
}>;
export const obstacleProperties = makeObjectProperties("obstacle", {
	zIndex: () => 0,
	clickbox: (obj: SkapObstacle, pos) => obj.bounds.contains(pos),
});