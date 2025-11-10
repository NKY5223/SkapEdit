import { Color } from "@common/color.ts";
import { createId, ID } from "@common/uuid.ts";
import { vec2, Vec2 } from "../common/vec2.ts";
import { Bounds, BoundsInit } from "./bounds.ts";
import { SkapIce, SkapLava, SkapObstacle, SkapSlime } from "./object/basic.ts";
import { SkapText } from "./object/text.ts";
import { SkapBlock } from "./object/block.ts";
import { SkapGravityZone } from "./object/gravityZone.ts";
import { CardinalDirection } from "./object/Base.ts";
import { SkapTeleporter } from "./object/teleporter.ts";

export type SkapObject = (
	| SkapObstacle
	| SkapLava
	| SkapSlime
	| SkapIce
	| SkapText
	| SkapBlock
	| SkapTeleporter
	| SkapGravityZone
);
export type SkapRoom = {
	id: ID;
	name: string;
	bounds: Bounds;
	obstacleColor: Color;
	backgroundColor: Color;
	objects: ReadonlyMap<ID, SkapObject>;
};
export type SkapMap = {
	author: string;
	name: string;
	version: number;
	spawn: {
		room: ID;
		position: Vec2;
	};
	rooms: ReadonlyMap<ID, SkapRoom>;
	/** 
	 * This property keeps track of if the map has been edited since it was opened.
	 * Allows us to pop the "are you sure" message when loading.
	 */
	edited: boolean;
};
// #endregion

// #region constructors

export const makeObstacle = (left: number, top: number, right: number, bottom: number): SkapObstacle => ({
	type: "obstacle",
	id: createId("obj-obstacle"),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const makeLava = (left: number, top: number, right: number, bottom: number): SkapLava => ({
	type: "lava",
	id: createId("obj-lava"),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const makeSlime = (left: number, top: number, right: number, bottom: number): SkapSlime => ({
	type: "slime",
	id: createId("obj-slime"),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const makeIce = (left: number, top: number, right: number, bottom: number): SkapIce => ({
	type: "ice",
	id: createId("obj-ice"),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const makeText = (x: number, y: number, text: string): SkapText => ({
	type: "text",
	id: createId("obj-text"),
	pos: vec2(x, y),
	text,
});
export const makeBlock = (left: number, top: number, right: number, bottom: number, color: Color, layer: 0 | 1, solid: boolean): SkapBlock => ({
	type: "block",
	id: createId("obj-block"),
	bounds: new Bounds({ left, top, right, bottom }),
	color,
	layer,
	solid,
});
export const makeGravityZone = (left: number, top: number, right: number, bottom: number, direction: SkapGravityZone["direction"]): SkapGravityZone => ({
	type: "gravityZone",
	id: createId("obj-gravityZone"),
	bounds: new Bounds({ left, top, right, bottom }),
	direction,
});
export const makeCardinalGravityZone = (left: number, top: number, right: number, bottom: number, direction: CardinalDirection): SkapGravityZone => ({
	type: "gravityZone",
	id: createId("obj-gravityZone"),
	bounds: new Bounds({ left, top, right, bottom }),
	direction: {
		type: "cardinal",
		direction,
	},
});
export const makeFreeGravityZone = (left: number, top: number, right: number, bottom: number, direction: number): SkapGravityZone => ({
	type: "gravityZone",
	id: createId("obj-gravityZone"),
	bounds: new Bounds({ left, top, right, bottom }),
	direction: {
		type: "free",
		direction,
	},
});
export const makeTeleporterPair = (
	left1: number, top1: number, right1: number, bottom1: number, direction1: CardinalDirection,
	left2: number, top2: number, right2: number, bottom2: number, direction2: CardinalDirection,
): [SkapTeleporter, SkapTeleporter] => {
	const id1 = createId("obj-teleporter");
	const id2 = createId("obj-teleporter");
	return [
		{
			type: "teleporter",
			id: id1,
			bounds: new Bounds({ left: left1, top: top1, right: right1, bottom: bottom1 }),
			direction: direction1,
			target: {
				type: "teleporter",
				teleporterId: id2,
			}
		},
		{
			type: "teleporter",
			id: id2,
			bounds: new Bounds({ left: left2, top: top2, right: right2, bottom: bottom2 }),
			direction: direction2,
			target: {
				type: "teleporter",
				teleporterId: id1,
			}
		},
	];
};

export const toIdMap = <T extends { id: ID; }>(objs: T[]): Map<ID, T> =>
	new Map(objs.map(o => [o.id, o]));

export const makeRoom = (
	name: string, bounds: BoundsInit,
	obstacleColor: Color, backgroundColor: Color, objects: SkapObject[]
): SkapRoom => ({
	id: createId("room"),
	name,
	bounds: new Bounds(bounds),
	obstacleColor,
	backgroundColor,
	objects: toIdMap(objects)
});

// #endregion