import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { M, L } from "../constructors.tsx";
import { stroke } from "../math.ts";
import { info } from "../utils.tsx";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";
import { arrowBidi } from "./arrow-bidi.ts";

export const split = (
	a: Vec2, b: Vec2,
	headSize: number = 4, 
	barSize: number = 10,
	width: number = 2,
	angle: Vec2 = defaultArrowAngle,
) => {
	const normDir = b.sub(a).norm();
	const normMat = orth(normDir);

	const mid = a.add(b).div(2);
	const bar0 = normMat.mul(vec2(0, -barSize)).add(mid);
	const bar1 = normMat.mul(vec2(0, barSize)).add(mid);

	const sOpt = defaultStroke(width);
	const commands = [
		arrowBidi(a, b, headSize, width, angle),
		stroke(sOpt, [
			M(bar0),
			L(bar1),
		].flat()),
	].flat();

	return commands;
};

export const splitsRaw = {
	x: split(vec2(4, 12), vec2(20, 12)),
	y: split(vec2(12, 4), vec2(12, 20)),
};
export const splits = {
	y: info(splitsRaw.y),
	x: info(splitsRaw.x),
};