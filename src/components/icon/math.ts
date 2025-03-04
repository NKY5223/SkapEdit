import { interleave, tuples, tuplesCyclical } from "../../utils.ts";
import { Vector, map, lerp, div, sub, vec, rotMat, matMul, matTranspose, dot, swap, mul, add, angle, neg, zeroVec, leftMat, norm, polar } from "./vector.ts";

// #region Command types
type CommandBase<T extends string> = {
	type: T;
	start: Vector;
	end: Vector;
};

export type CommandLine = CommandBase<"line">;
export type CommandArc = CommandBase<"arc"> & {
	radius: Vector;

	rotation: number;
	largeArc: boolean;
	clockwise: boolean;
};
export type Command = (
	| CommandLine
	| CommandArc
);
// #endregion

type ArcInfo = {
	center: Vector;
	startAngle: number;
	deltaAngle: number;
	endAngle: number;
};
const TAU = 2 * Math.PI;
const square = map(x => x * x);
export const arcInfo = (arc: CommandArc): ArcInfo => {
	const { start, end, radius, rotation, clockwise, largeArc } = arc;

	const mid = lerp(start, end, .5);
	const diff = div(sub(start, end), vec(2));
	const cwRotation = rotMat(rotation);

	const startPrime = matMul(matTranspose(cwRotation), diff);
	const rSquare = square(radius);
	const startPrimeSquare = square(startPrime);

	const alpha = dot(rSquare, swap(startPrimeSquare));
	const centerPrime = mul(vec(
		(largeArc !== clockwise ? +1 : -1) * Math.sqrt(
			(rSquare[0] * rSquare[1] - alpha) / alpha
		)
	), vec(1, -1), div(radius, swap(radius)), swap(startPrime));

	const center = add(matMul(cwRotation, centerPrime), mid);
	const startAngle = angle(vec(1, 0), div(sub(startPrime, centerPrime), radius));
	const endAngle = angle(vec(1, 0), div(sub(neg(startPrime), centerPrime), radius));
	const angleDiff = endAngle - startAngle;
	const deltaAngle = (clockwise
		? angleDiff < 0 ? angleDiff + TAU : angleDiff
		: angleDiff > 0 ? angleDiff - TAU : angleDiff
	);

	return {
		center,
		startAngle, deltaAngle, endAngle
	};
};
export const reverseCommands = (commands: Command[]): Command[] => {
	const last = commands.at(-1);
	if (!last) throw new Error("Expected segment to be non-empty");
	return commands.toReversed().map(command => reverseCommand(command));
};
export const reverseCommand = (command: Command): Command => {
	const positions = {
		start: command.end,
		end: command.start,
	};
	switch (command.type) {
		case "line":
			return {
				type: "line",
				...positions,
			} satisfies CommandLine;
		case "arc":
			return {
				...command,
				...positions,
				clockwise: !command.clockwise,
			} satisfies CommandArc;
	}
};
export const offsetCommand = (command: Command, /** offset, to the left */ offset: number): Command[] => {
	const { start, end } = command;
	const diff = sub(end, start);
	switch (command.type) {
		case "line":
			const normal = mul(matMul(leftMat, norm(diff)), vec(offset));

			return [{
				type: "line",
				start: add(start, normal),
				end: add(end, normal),
			} satisfies CommandLine];
		case "arc":
			const { radius, rotation, largeArc, clockwise } = command;
			const { center, startAngle, endAngle } = arcInfo(command);
			if (radius[0] === radius[1]) {
				// circle
				const r = radius[0] + (clockwise ? offset : -offset);

				const start = add(center, polar(startAngle, r));
				const end = add(center, polar(endAngle, r));

				return [{
					type: "arc",
					start,
					radius: vec(r),
					rotation,
					largeArc,
					clockwise,
					end,
				}];
			}
			// ellipse :despair:
			return [command];
	}
};

export type StrokeCap = "join";
export type StrokeJoin = "join";
export type StrokeOptions = {
	widthLeft: number;
	widthRight: number;

	join: StrokeJoin;
};
export type Stroke = [Command[], Command[]];
export const stroke = (options: StrokeOptions, commands: Command[]): Stroke => {
	const forwardParts = commands.map(command => offsetCommand(command, options.widthLeft));
	const reverseParts = reverseCommands(commands).map(command => offsetCommand(command, options.widthRight));

	const forward = joinCommands(options.join, forwardParts);
	const reverse = joinCommands(options.join, reverseParts);

	return [
		forward, reverse
	];
};
export type CapOptions = {
	start: StrokeCap;
	end: StrokeCap;
};
export type JoinOptions = StrokeJoin;

export const joinCommandPair = (options: JoinOptions, a: Command, b: Command): Command[] => {
	switch (options) {
		case "join": {
			return [
				{
					type: "line",
					start: a.end,
					end: b.start,
				} satisfies CommandLine,
			];
		}
	}
};
const joinCommands = (options: JoinOptions, commands: Command[][]): Command[] => {
	if (commands.length === 1) return commands.flat();
	const joins = tuples(commands, 2).map(([a, b]) => joinCommandPair(options, a[a.length - 1], b[0]));
	return interleave(commands, joins).flat();
}
export const joinStrokes = (options: JoinOptions, strokes: Stroke[]): Stroke => {
	// TUPLE HELL
	if (strokes.length < 2) throw new Error(`Cannot join less than 2 strokes`);
	const forwards = strokes.map(([f, _]) => f);
	// = [f0, f1, f2]
	const reverses = strokes.map(([_, r]) => r);
	// = [r0, r1, r2]
	const pairs = tuples(strokes, 2);
	// = [[[f0, r0], [f1, r1]], [[f1, r1], [f2, r2]]]
	const forwardJoins = pairs.map(([[a, _], [b, __]]) =>
		// i = 0: a = f0, b = f1
		joinCommandPair(options, a[a.length - 1], b[0])
	);
	// = [join(f0, f1), join(f1, f2)]
	const reverseJoins = pairs.map(([[_, b], [__, a]]) =>
		// i = 0: a = r1, b = r0
		joinCommandPair(options, a[a.length - 1], b[0])
	);
	// = [join(r1, r0), join(r2, r1)]

	const forward = interleave(forwards, forwardJoins).flat();
	// = [f0, join(f0, f1), f1, join(f1, f2), f2]
	const reverse = interleave(reverses, reverseJoins).toReversed().flat();
	// = [r2, join(r2, r1), r1, join(r1, r0), r0]

	return [forward, reverse];
};
export const joinStrokesLooped = (options: JoinOptions, strokes: Stroke[]): Command[] => {
	if (strokes.length === 0) return [];
	// TUPLE HELL
	const forwards = strokes.map(([f, _]) => f);
	// = [f0, f1, f2]
	const reverses = strokes.map(([_, r]) => r);
	// = [r0, r1, r2]
	const pairs = tuplesCyclical(strokes, 2);
	// = [[[f0, r0], [f1, r1]], [[f1, r1], [f2, r2]], [[f2, r2], [f0, r0]]]
	const forwardJoins = pairs.map(([[a, _], [b, __]]) =>
		// i = 0: a = f0, b = f1
		joinCommandPair(options, a[a.length - 1], b[0])
	);
	// = [join(f0, f1), join(f1, f2), join(f2, f0)]
	const reverseJoins = pairs.map(([[_, a], [__, b]]) =>
		// i = 0: a = r1, b = r0
		joinCommandPair(options, b[b.length - 1], a[0])
	);
	// = [join(r1, r0), join(r2, r1), join(r0, r2)]

	const forward = interleave(forwards, forwardJoins).flat();
	// = [f0, join(f0, f1), f1, join(f1, f2), f2, join(f2, f0)]
	const reverse = interleave(reverses, reverseJoins).flat();
	// = [r2, join(r2, r1), r1, join(r1, r0), r0, join(r0, r2)]

	return [
		...forward,
		...reverse,
	];
};
const capCommands = (type: StrokeCap, isStart: boolean, a: Command, b: Command): Command[] => {
	switch (type) {
		case "join": {
			return [
				{
					type: "line",
					start: a.end,
					end: b.start,
				} satisfies CommandLine,
			]
		}
	}
};
export const capStroke = (options: CapOptions, stroke: Stroke): Command[] => {
	const [forward, reverse] = stroke;
	const startCap = capCommands(options.start, true, reverse[reverse.length - 1], forward[0]);
	const endCap = capCommands(options.end, true, forward[forward.length - 1], reverse[0]);

	return [
		...forward,
		...startCap,
		...reverse,
		...endCap,
	]
};