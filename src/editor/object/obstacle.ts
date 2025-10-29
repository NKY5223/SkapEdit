import { Bounds } from "@editor/bounds.ts";
import { BaseObject, boundsObjectProperties } from "@editor/object/Base";

export type SkapObstacle = BaseObject<"obstacle", {
	bounds: Bounds;
}>;
export const obstacleProperties = boundsObjectProperties<SkapObstacle>("obstacle", 0);