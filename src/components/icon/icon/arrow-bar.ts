import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { M, L } from "../constructors.tsx";
import { stroke, StrokeOptions } from "../math.ts";
import { info } from "../utils.tsx";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";
import { chevron } from "./chevron.ts";

export const arrowBar = (
	tail: Vec2, head: Vec2,
	headSize: number = 5, 
	/** Represents the vector from the head to the start of the bar, in local space */
	bar: Vec2 = vec2(4, 8),
	width: number = 2,
	angle: Vec2 = defaultArrowAngle,
) => {
	const normDir = head.sub(tail).norm();
	const normMat = orth(normDir);
	const direction = normDir.mul(headSize);

	const bar0 = normMat.mul(bar.mul(vec2(1, -1))).add(head);
	const bar1 = normMat.mul(bar).add(head);

	const sOpt = defaultStroke(width);
	const commands = [
		chevron(direction, head, width, angle),
		stroke(sOpt, [
			M(tail),
			L(head),
		].flat()),
		stroke(sOpt, [
			M(bar0),
			L(bar1),
		].flat()),
	].flat();

	return commands;
};

export const arrowBarsRaw = {
	left: arrowBar(vec2(20, 12), vec2(9, 12)),
	right: arrowBar(vec2(4, 12), vec2(15, 12)),
	up: arrowBar(vec2(12, 20), vec2(12, 9)),
	down: arrowBar(vec2(12, 4), vec2(12, 15)),
};
export const arrowBars = {
	up: info(arrowBarsRaw.up),
	down: info(arrowBarsRaw.down),
	left: info(arrowBarsRaw.left),
	right: info(arrowBarsRaw.right),
};