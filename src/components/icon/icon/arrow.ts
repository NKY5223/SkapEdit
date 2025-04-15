import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { M, L } from "../constructors.tsx";
import { stroke, StrokeOptions } from "../math.ts";
import { info } from "../utils.tsx";
import { chevron } from "./chevron.ts";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";

export const arrow = (
	tail: Vec2, head: Vec2,
	headSize: number = 5, width: number = 2,
	angle: Vec2 = defaultArrowAngle,
) => {
	const direction = head.sub(tail).norm(headSize);

	const sOpt = defaultStroke(width);
	const commands = [
		chevron(direction, head, width, angle),
		stroke(sOpt, [
			M(tail),
			L(head),
		].flat()),
	].flat();

	return commands;
};

export const arrowsRaw = {
	left: arrow(vec2(18, 12), vec2(6, 12)),
	right: arrow(vec2(6, 12), vec2(18, 12)),
	up: arrow(vec2(12, 18), vec2(12, 6)),
	down: arrow(vec2(12, 6), vec2(12, 18)),
};
export const arrows = {
	up: info(arrowsRaw.up),
	down: info(arrowsRaw.down),
	left: info(arrowsRaw.left),
	right: info(arrowsRaw.right),
};