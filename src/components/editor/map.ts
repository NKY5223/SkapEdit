import { createContext, useContext } from "react";
import { Bounds } from "./bounds.ts";
import { Vec2 } from "../../common/vec2.ts";


export type SkapObstacle = {
	type: "obstacle";
	bounds: Bounds;
};
export type SkapText = {
	type: "text";
	pos: Vec2;
	text: string;
};

export type SkapObject = (
	| SkapObstacle
	| SkapText
);
// can't name it Map because naming collision
export type SkapMap = {
	objects: SkapObject[];
};

export const mapContext = createContext<SkapMap>({
	objects: [],
});
export const useMap = () => useContext(mapContext);