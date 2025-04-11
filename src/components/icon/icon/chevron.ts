import { orth, vec2, Vec2 } from "@common/vec2.ts";
import { L, M, stroke } from "../constructors.tsx";

const chevron = (direction: Vec2, start: Vec2, width: number = 2) => {
	const mat = orth(direction);
	const d0 = mat.mul(vec2(-1, -1));
	const d1 = mat.mul(vec2(-1, 1));

	const commands = stroke({
		widthLeft: width / 2,
		widthRight: width / 2,
		capStart: "butt",
		capEnd: "butt",
		join: "miter",
	}, [
		M(start.add(d0)),
		L(start),
		L(start.add(d1)),
	].flat());

	return commands;
}

export const chevronRight = chevron(
	vec2(6, 0),
	vec2(15, 12)
);