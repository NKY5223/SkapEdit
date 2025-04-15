import { createContext, useContext } from "react";
import { Bounds } from "./bounds.ts";
import { Vec2 } from "../common/vec2.ts";
import { createId } from "@common/uuid.ts";

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
export type SkapMap = {
	objects: SkapObject[];
};
// #endregion

// #region constructors
export const obstacle = (bounds: Bounds): SkapObstacle => ({
	type: "obstacle",
	id: createId(),
	bounds,
});
export const lava = (bounds: Bounds): SkapLava => ({
	type: "lava",
	id: createId(),
	bounds,
});
export const text = (pos: Vec2, text: string): SkapText => ({
	type: "text",
	id: createId(),
	pos,
	text,
});
// #endregion

const mapContext = createContext<SkapMap>({
	objects: [],
});
export const MapProvider = mapContext.Provider;
export const useMap = () => useContext(mapContext);
