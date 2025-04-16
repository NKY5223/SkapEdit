import { createContext, useContext } from "react";
import { Bounds } from "./bounds.ts";
import { vec2, Vec2 } from "../common/vec2.ts";
import { createId } from "@common/uuid.ts";
import { Color } from "@common/color.ts";

// #region types
type BaseObject<T extends string, P> = {
	type: T;
	id: string;
} & P;
export type SkapObstacle = BaseObject<"obstacle", {
	bounds: Bounds;
}>;
export type SkapLava = BaseObject<"lava", {
	bounds: Bounds;
}>;
export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;

export type SkapObject = (
	| SkapObstacle
	| SkapLava
	| SkapText
);
export type SkapRoom = {
	bounds: Bounds;
	obstacleColor: Color;
	backgroundColor: Color;
	objects: SkapObject[];
};
// #endregion

// #region constructors
export const obstacle = (left: number, top: number, right: number, bottom: number): SkapObstacle => ({
	type: "obstacle",
	id: createId(),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const lava = (left: number, top: number, right: number, bottom: number): SkapLava => ({
	type: "lava",
	id: createId(),
	bounds: new Bounds({ left, top, right, bottom }),
});
export const text = (x: number, y: number, text: string): SkapText => ({
	type: "text",
	id: createId(),
	pos: vec2(x, y),
	text,
});
// #endregion

const mapContext = createContext<SkapRoom>({
	bounds: new Bounds({ left: 0, top: 0, right: 100, bottom: 100 }),
	obstacleColor: Color.hex(0x000a57, .8),
	backgroundColor: Color.hex(0xe0e0e0),
	objects: [],
});
export const MapProvider = mapContext.Provider;
export const useMap = () => useContext(mapContext);
