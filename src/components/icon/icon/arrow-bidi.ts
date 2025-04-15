import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { M, L } from "../constructors.tsx";
import { stroke, StrokeOptions } from "../math.ts";
import { info } from "../utils.tsx";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";
import { chevron } from "./chevron.ts";

export const arrowBidi = (
	a: Vec2, b: Vec2,
	headSize: number = 5, width: number = 2,
	angle: Vec2 = defaultArrowAngle,
) => {
	const direction = b.sub(a).norm(headSize);

	const sOpt = defaultStroke(width);
	const commands = [
		chevron(direction, b, width, angle),
		chevron(direction.neg(), a, width, angle),
		stroke(sOpt, [
			M(a),
			L(b),
		].flat()),
	].flat();

	return commands;
};

export const arrowBidisRaw = {
	x: arrowBidi(vec2(20, 12), vec2(4, 12)),
	y: arrowBidi(vec2(12, 20), vec2(12, 4)),
};
export const arrowBidis = {
	x: info(arrowBidisRaw.x),
	y: info(arrowBidisRaw.y),
};