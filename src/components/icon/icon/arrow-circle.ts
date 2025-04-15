import { ccw90, polar, rotationMat, vec2, Vec2 } from "@common/vec2.ts";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";
import { stroke } from "../math.ts";
import { chevron } from "./chevron.ts";
import { A, M } from "../constructors.tsx";
import { info } from "../utils.tsx";

export const arrowCircle = (
	center: Vec2, radius: number,
	angle0: number, angle1: number,
	arrowSize: number = 4, width: number = 2,
	headOffset: number = 0.5,
	angle: Vec2 = defaultArrowAngle,
) => {
	const clockwise = angle1 > angle0;
	const sign = clockwise ? -1 : 1
	const largeArc = Math.abs(angle1 - angle0) > Math.PI;
	const direction = ccw90.mul(polar(angle1)).mul(sign, arrowSize);

	const rotate = rotationMat(headOffset * sign);

	const head = center.add(polar(angle1, radius));
	const tail = center.add(polar(angle0, radius));

	const sOpt = defaultStroke(width);
	const arc = [
		M(tail),
		A(radius, radius, 0, largeArc, clockwise, head[0], head[1]),
	].flat();
	const commands = [
		chevron(rotate.mul(direction), head, width, angle),
		stroke(sOpt, arc)
	].flat();

	return commands;
}

export const arrowCirclesRaw = {
	clockwise: arrowCircle(vec2(12), 6, 0, Math.PI * 3.5 / 2),
	counterclockwise: arrowCircle(vec2(12), 6, 0, -Math.PI * 3.5 / 2),
	largeClockwise: arrowCircle(vec2(12), 7, 0, Math.PI * 3.5 / 2),
	largeCounterclockwise: arrowCircle(vec2(12), 7, 0, -Math.PI * 3.5 / 2),
};
export const arrowCircles = {
	clockwise: info(arrowCirclesRaw.clockwise),
	counterclockwise: info(arrowCirclesRaw.counterclockwise),
	largeClockwise: info(arrowCirclesRaw.largeClockwise),
	largeCounterclockwise: info(arrowCirclesRaw.largeCounterclockwise),
};