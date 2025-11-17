import { Color } from "@common/color.ts";
import { createId, ID } from "@common/uuid.ts";
import { vec2, Vec2 } from "../common/vec2.ts";
import { Bounds, BoundsInit } from "./bounds.ts";
import { SkapIce, SkapLava, SkapObstacle, SkapSlime } from "./object/basic.ts";
import { SkapText } from "./object/text.ts";
import { SkapBlock } from "./object/block.ts";
import { SkapGravityZone } from "./object/gravityZone.ts";
import { CardinalDirection } from "./object/Base.tsx";
import { SkapTeleporter } from "./object/teleporter.ts";
import { SkapSpawner } from "./object/spawner.tsx";
import { SkapRotatingLava } from "./object/rotating.tsx";
import { SkapCircularIce, SkapCircularLava, SkapCircularObstacle, SkapCircularSlime } from "./object/circular.tsx";
import { MovingPoint, SkapMovingIce, SkapMovingLava, SkapMovingObstacle, SkapMovingSlime } from "./object/moving.tsx";
import { SkapTurret } from "./object/turret.tsx";

export type SkapObject = (
	| SkapObstacle
	| SkapLava
	| SkapSlime
	| SkapIce
	| SkapText
	| SkapBlock
	| SkapTeleporter
	| SkapGravityZone
	| SkapSpawner
	| SkapRotatingLava
	| SkapCircularObstacle
	| SkapCircularLava
	| SkapCircularSlime
	| SkapCircularIce
	| SkapMovingObstacle
	| SkapMovingLava
	| SkapMovingSlime
	| SkapMovingIce
	| SkapTurret
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

// #region object
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
export const makeSpawner = (left: number, top: number, right: number, bottom: number, entities: SkapSpawner["entities"]): SkapSpawner => ({
	type: "spawner",
	id: createId("obj-spawner"),
	bounds: new Bounds({ left, top, right, bottom }),
	entities,
});
export const makeSpawnerEntity = (type: string, count: number, speed: number, radius: number): SkapSpawner["entities"][number] => ({
	type, count, speed, radius
});
export const makeRotatingLava = (left: number, top: number, right: number, bottom: number,
	center: Vec2, initial: number, speed: number): SkapRotatingLava => ({
		type: "rotatingLava",
		id: createId("obj-spawner"),
		bounds: new Bounds({ left, top, right, bottom }),
		rotation: {
			center,
			initial,
			speed,
		},
	});

export const makeCircularObstacle = (x: number, y: number, radius: number): SkapCircularObstacle => ({
	type: "circularObstacle",
	id: createId("obj-circularObstacle"),
	pos: vec2(x, y),
	radius,
});
export const makeCircularLava = (x: number, y: number, radius: number): SkapCircularLava => ({
	type: "circularLava",
	id: createId("obj-circularLava"),
	pos: vec2(x, y),
	radius,
});
export const makeCircularSlime = (x: number, y: number, radius: number): SkapCircularSlime => ({
	type: "circularSlime",
	id: createId("obj-circularSlime"),
	pos: vec2(x, y),
	radius,
});
export const makeCircularIce = (x: number, y: number, radius: number): SkapCircularIce => ({
	type: "circularIce",
	id: createId("obj-circularIce"),
	pos: vec2(x, y),
	radius,
});

export const makeMovePoint = (x: number, y: number, time: number): MovingPoint => ({
	pos: vec2(x, y),
	time,
});
export const makeMovingObstacle = (width: number, height: number, period: number, points: readonly MovingPoint[]): SkapMovingObstacle => ({
	type: "movingObstacle",
	id: createId("obj-movingObstacle"),
	size: vec2(width, height),
	period,
	points,
});
export const makeMovingLava = (width: number, height: number, period: number, points: readonly MovingPoint[]): SkapMovingLava => ({
	type: "movingLava",
	id: createId("obj-movingLava"),
	size: vec2(width, height),
	period,
	points,
});
export const makeMovingSlime = (width: number, height: number, period: number, points: readonly MovingPoint[]): SkapMovingSlime => ({
	type: "movingSlime",
	id: createId("obj-movingSlime"),
	size: vec2(width, height),
	period,
	points,
});
export const makeMovingIce = (width: number, height: number, period: number, points: readonly MovingPoint[]): SkapMovingIce => ({
	type: "movingIce",
	id: createId("obj-movingIce"),
	size: vec2(width, height),
	period,
	points,
});

export const makeTurret = (x: number, y: number, left: number, top: number, right: number, bottom: number,
	bulletRadius: number, bulletInterval: number, bulletSpeed: number, groupInterval: number, groupSize: number,
): SkapTurret => ({
	type: "turret",
	id: createId("obj-turret"),
	pos: vec2(x, y),
	region: new Bounds({ left, top, right, bottom }),
	bulletRadius,
	bulletInterval,
	bulletSpeed,
	groupInterval,
	groupSize,
});
// #endregion

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