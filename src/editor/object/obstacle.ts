import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeSimpleBoundsObjectProperties } from "@editor/object/Base";

export type SkapObstacle = BaseObject<"obstacle", {
	bounds: Bounds;
}>;
export const obstacleProperties = makeSimpleBoundsObjectProperties<SkapObstacle>("obstacle", 0);