import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeSimpleBoundsObjectProperties } from "@editor/object/Base";

type Basic<T extends string> = BaseObject<T, { bounds: Bounds }>;

export type SkapObstacle = Basic<"obstacle">;
export const obstacleProperties = makeSimpleBoundsObjectProperties<SkapObstacle>("obstacle", 2);

export type SkapLava = Basic<"lava">;
export const lavaProperties = makeSimpleBoundsObjectProperties<SkapLava>("lava", 4);

export type SkapSlime = Basic<"slime">;
export const slimeProperties = makeSimpleBoundsObjectProperties<SkapSlime>("slime", 6);

export type SkapIce = Basic<"ice">;
export const iceProperties = makeSimpleBoundsObjectProperties<SkapIce>("ice", 5);