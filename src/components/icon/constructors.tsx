import { vec2, Vec2, zero } from "../../common/vec2.ts";
import { Vector } from "../../common/vector.ts";
import {
	CommandLine, CommandArc,
	StrokeOptions, stroke as importmath_stroke,
	Command,
	fromSVGArc,
} from "./math.ts";

const line = (start: Vec2, end: Vec2): CommandLine => ({
	type: "line",
	start, end,
});
const arc = (radius: Vec2, rotation: number, largeArc: boolean, clockwise: boolean, start: Vec2, end: Vec2): CommandArc => {
	const { center, startAngle, deltaAngle, endAngle } = fromSVGArc({
		start, end, radius, rotation, largeArc, clockwise,
	});
	return {
		type: "arc",
		radius,
		rotation,
		start, end,
		center, 
		startAngle, deltaAngle, endAngle,
	};
}

let constructorStart: Vec2 = zero;
export const M = (x: number, y: number): Command[] => {
	const end: Vec2 = vec2(x, y);
	constructorStart = end;
	return [];
}
export const m = (dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = start.add(vec2(dx, dy));
	constructorStart = end;
	return [];
};
export const L = (x: number, y: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = vec2(x, y);
	constructorStart = end;
	return [line(start, end)];
};
export const l = (dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = start.add(vec2(dx, dy));
	constructorStart = end;
	return [line(start, end)];
};
export const H = (x: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = vec2(x, start[1]);
	constructorStart = end;
	return [line(start, end)];
};
export const h = (dx: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = start.add(vec2(dx, 0));
	constructorStart = end;
	return [line(start, end)];
};
export const V = (y: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = vec2(start[0], y);
	constructorStart = end;
	return [line(start, end)];
};
export const v = (dy: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = start.add(vec2(0, dy));
	constructorStart = end;
	return [line(start, end)];
};
export const A = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, x: number, y: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = vec2(x, y);
	constructorStart = end;
	return [arc(vec2(rx, ry), rotation, largeArc, clockwise, start, end)];
};
export const a = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vec2 = start.add(vec2(dx, dy));
	constructorStart = end;
	return [arc(vec2(rx, ry), rotation, largeArc, clockwise, start, end)];
};
export const Circle = (cx: number, cy: number): Command[] => {
	const start = constructorStart;
	const center = vec2(cx, cy);
	const opposite = Vector.lerp(start, center)(2);
	const r = center.sub(start).mag();
	return [
		arc(vec2(r), 0, false, true, start, opposite),
		arc(vec2(r), 0, false, true, opposite, start),
	];
};
export const circle = (dcx: number, dcy: number): Command[] => {
	const center = constructorStart.add(vec2(dcx, dcy));
	return Circle(center[0], center[1]);
}

export const stroke = (options: StrokeOptions, commands: Command[]): Command[] => {
	return importmath_stroke(options, commands);
};