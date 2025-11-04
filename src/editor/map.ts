import { Color } from "@common/color.ts";
import { createId, ID } from "@common/uuid.ts";
import { vec2, Vec2 } from "../common/vec2.ts";
import { Bounds, BoundsInit } from "./bounds.ts";
import { SkapLava } from "./object/lava.ts";
import { SkapObstacle } from "./object/obstacle.ts";
import { SkapText } from "./object/text.ts";

export type SkapObject = (
	| SkapObstacle
	| SkapLava
	| SkapText
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
export const makeText = (x: number, y: number, text: string): SkapText => ({
	type: "text",
	id: createId("obj-text"),
	pos: vec2(x, y),
	text,
});
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