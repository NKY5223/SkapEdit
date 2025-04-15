import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { L, M, stroke } from "../constructors.tsx";
import { info } from "../utils.tsx";
import { defaultArrowAngle, defaultStroke } from "./shared.ts";

export const chevron = (
	direction: Vec2, start: Vec2, 
	width: number = 2, 
	angle = defaultArrowAngle,
) => {
	const mat = orth(direction);
	const d0 = mat.mul(angle.mul(vec2(1, -1)));
	const d1 = mat.mul(angle);

	const sOpt = defaultStroke(width);

	const commands = stroke(sOpt, [
		M(start.add(d0)),
		L(start),
		L(start.add(d1)),
	].flat());

	return commands;
}
export const chevronsRaw = {
	up: chevron(
		vec2(0, -6),
		vec2(12, 9)
	),
	down: chevron(
		vec2(0, 6),
		vec2(12, 15)
	),
	left: chevron(
		vec2(-6, 0),
		vec2(9, 12)
	),
	right: chevron(
		vec2(6, 0),
		vec2(15, 12)
	),
};
export const chevrons = {
	up: info(chevronsRaw.up),
	down: info(chevronsRaw.down),
	left: info(chevronsRaw.left),
	right: info(chevronsRaw.right),
}