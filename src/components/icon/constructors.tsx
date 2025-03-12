import {
	CommandLine, CommandArc,
	StrokeOptions, stroke as importmath_stroke,
	Command,
	OffsetCommand,
	fromSVGArc,
} from "./math.ts";
import { add, lerp, mag, sub, vec, Vector, zeroVec } from "./vector.ts";

const line = (start: Vector, end: Vector): CommandLine => ({
	type: "line",
	start, end,
});
const arc = (radius: Vector, rotation: number, largeArc: boolean, clockwise: boolean, start: Vector, end: Vector): CommandArc => {
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

let constructorStart: Vector = zeroVec;
export const M = (x: number, y: number): Command[] => {
	const end: Vector = vec(x, y);
	constructorStart = end;
	return [];
}
export const m = (dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vector = add(start, vec(dx, dy));
	constructorStart = end;
	return [];
};
export const L = (x: number, y: number): Command[] => {
	const start = constructorStart;
	const end: Vector = vec(x, y);
	constructorStart = end;
	return [line(start, end)];
};
export const l = (dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vector = add(start, vec(dx, dy));
	constructorStart = end;
	return [line(start, end)];
};
export const H = (x: number): Command[] => {
	const start = constructorStart;
	const end: Vector = vec(x, start[1]);
	constructorStart = end;
	return [line(start, end)];
};
export const h = (dx: number): Command[] => {
	const start = constructorStart;
	const end: Vector = add(start, vec(dx, 0));
	constructorStart = end;
	return [line(start, end)];
};
export const V = (y: number): Command[] => {
	const start = constructorStart;
	const end: Vector = vec(start[0], y);
	constructorStart = end;
	return [line(start, end)];
};
export const v = (dy: number): Command[] => {
	const start = constructorStart;
	const end: Vector = add(start, vec(0, dy));
	constructorStart = end;
	return [line(start, end)];
};
export const A = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, x: number, y: number): Command[] => {
	const start = constructorStart;
	const end: Vector = vec(x, y);
	constructorStart = end;
	return [arc(vec(rx, ry), rotation, largeArc, clockwise, start, end)];
};
export const a = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, dx: number, dy: number): Command[] => {
	const start = constructorStart;
	const end: Vector = add(start, vec(dx, dy));
	constructorStart = end;
	return [arc(vec(rx, ry), rotation, largeArc, clockwise, start, end)];
};
export const Circle = (cx: number, cy: number): Command[] => {
	const start = constructorStart;
	const center = vec(cx, cy);
	const opposite = lerp(start, center, 2);
	const r = mag(sub(center, start));
	return [
		arc(vec(r), 0, false, true, start, opposite),
		arc(vec(r), 0, false, true, opposite, start),
	];
};
export const circle = (dcx: number, dcy: number): Command[] => {
	const center = add(constructorStart, vec(dcx, dcy));
	return Circle(center[0], center[1]);
}

export const stroke = (options: StrokeOptions, commands: Command[]): Command[] => {
	return importmath_stroke(options, commands);
};