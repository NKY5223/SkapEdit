import { vec2 } from "@common/vec2.ts";
import { StrokeOptions } from "../math.ts";

export const defaultStroke = (width: number): StrokeOptions => ({
	widthLeft: width / 2,
	widthRight: width / 2,
	capStart: "butt",
	capEnd: "butt",
	join: "miter",
});

export const defaultArrowAngle = vec2(-1, 1);