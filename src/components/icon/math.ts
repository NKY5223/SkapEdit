import { interleave, transposeTuples, tuples } from "../../utils.ts";
import { debug } from "./stringify.tsx";
import { Vector, map, lerp, div, sub, vec, rotMat, matMul, matTranspose, dot, swap, mul, add, angleBetween, neg, leftMat, norm, polar, safeNorm, equal, det, mat, arg, mag, parallel, isVec } from "./vector.ts";

const TAU = 2 * Math.PI;
const HALF_PI = Math.PI / 2;
// #region Command types
type CommandBase<T extends string> = {
	type: T;
	start: Vector;
	end: Vector;
};

export type CommandLine = CommandBase<"line">;
export type CommandArc = CommandBase<"arc"> & {
	radius: Vector;
	center: Vector;

	rotation: number;
	startAngle: number;
	deltaAngle: number;
	endAngle: number;
};
export type Command = (
	| CommandLine
	| CommandArc
);
// #endregion

// #region Command info
type SVGArc = {
	start: Vector;
	end: Vector;
	radius: Vector;
	rotation: number;
	largeArc: boolean;
	clockwise: boolean;
};
const square = map(x => x * x);
export const fromSVGArc = (arc: SVGArc): CommandArc => {
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
	const startAngle = angleBetween(vec(1, 0), div(sub(startPrime, centerPrime), radius));
	const endAngle = angleBetween(vec(1, 0), div(sub(neg(startPrime), centerPrime), radius));
	const angleDiff = endAngle - startAngle;
	const deltaAngle = (clockwise
		? angleDiff < 0 ? angleDiff + TAU : angleDiff
		: angleDiff > 0 ? angleDiff - TAU : angleDiff
	);

	return {
		type: "arc",
		start, end,
		radius,
		center,
		rotation,
		startAngle, deltaAngle, endAngle
	};
};
export const toSVGArc = (arc: CommandArc): SVGArc => {
	const { start, end, radius, rotation, deltaAngle } = arc;
	const largeArc = deltaAngle > Math.PI;
	const clockwise = deltaAngle > 0;
	return {
		start, end,
		radius,
		largeArc, clockwise,
		rotation,
	};
}

/**
 * Returns an `f: [0, 1] → Vector` that 
 * maps `t` to a point on the command.
 * 
 * Note: `t` is not arc length.
 */
export const parametrizeCommand = (command: Command): ((t: number) => Vector) => {
	const { start, end } = command;
	switch (command.type) {
		case "line": {
			return t => lerp(start, end, t);
		}
		case "arc": {
			const { radius, rotation, center, startAngle, deltaAngle } = command;
			const rot = rotMat(rotation);
			return t =>
				add(center, matMul(rot, mul(radius, polar((startAngle + deltaAngle * t)))));
		}
	}
}
/**
 * Returns an `f': [0, 1] → Vector` that
 * represents the derivative of `parametrizeCommand(command)` at `t`.
 * 
 * Note: `t` is not arc length.
 */
export const commandDerivative = (command: Command): ((t: number) => Vector) => {
	const { start, end } = command;
	switch (command.type) {
		case "line": {
			const d = sub(end, start);
			return () => d;
		}
		case "arc": {
			const { radius, rotation, startAngle, deltaAngle } = command;
			const rot = rotMat(rotation);
			// f = t ↦ center + rot × (radius \× polar(a0 + da * t)))
			// f' = rot × da × r \× polar(a0 + da * t + π/2)
			return t => mul(deltaAngle, matMul(rot, mul(radius, polar((startAngle + deltaAngle * t + HALF_PI)))));
		}
		default: {
			// Approximate derivative
			const ε = 0.00001;
			const f = parametrizeCommand(command);
			return t => div(sub(f(t + ε), f(t)), vec(ε));
		}
	}
}
/**
 * Returns an `f'/|f'|: [0, 1] → Vector` that
 * represents the tangent of `parametrizeCommand(command)` at `t`.  
 * Contains additional features to resolve `f' = 0`.
 * 
 * Note: `t` is not arc length.
 */
export const commandTangent = (command: Command): ((t: number) => Vector) => {
	switch (command.type) {
		default: {
			const f = commandDerivative(command);
			return t => safeNorm(f(t));
		}
	}
}

export const sliceCommand = (command: Command, tStart: number, tEnd: number): Command[] => {
	const f = parametrizeCommand(command);
	const start = f(tStart);
	const end = f(tEnd);
	if (tEnd <= tStart) return [];

	switch (command.type) {
		case "line": {
			return [
				{
					...command,
					start,
					end,
				}
			];
		}
		case "arc": {
			const { startAngle, deltaAngle, } = command;
			const props = {
				startAngle: startAngle + tStart * deltaAngle,
				endAngle: startAngle + tEnd * deltaAngle,
				deltaAngle: (tEnd - tStart) * deltaAngle,
			}
			return [
				{
					...command,
					...props,
					start,
					end,
				}
			]
		}
	}
}

type IntersectionData = {
	a: number;
	b: number;
	pos: Vector;
};
export const intersectCommands = (a: Command, b: Command, debugPhase?: string): IntersectionData[] => {
	// Require a.type <= b.type alphabetically
	if (a.type > b.type) {
		const reorder = intersectCommands(b, a);
		return reorder.map(({ a, b, pos }) => ({ a: b, b: a, pos }));
	}
	if (a.type === "line" && b.type === "line") {
		// https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line_segment
		const { start: a0, end: a1 } = a;
		const { start: b0, end: b1 } = b;
		const da = sub(a1, a0);
		const db = sub(b1, b0);
		const fa = parametrizeCommand(a);
		const fb = parametrizeCommand(b);

		const quot = div(da, db);
		if (quot[0] === quot[1]) {
			// parallel lines
			return [];
		}

		const { ta, tb } = intersectLines(a0, a1, b0, b1);

		if (0 <= ta && ta <= 1 && 0 <= tb && tb <= 1) return [{
			a: ta,
			b: tb,
			pos: fa(ta),
		}];

		return [];
	}
	if (a.type === "arc" && b.type === "line") {
		const { radius, rotation, center, startAngle, deltaAngle, endAngle } = a;
		const { start: b0, end: b1 } = b;
		const fb = parametrizeCommand(b);

		const invRot = rotMat(-rotation);

		const l0 = div(matMul(invRot, sub(b0, center)), radius);
		const l1 = div(matMul(invRot, sub(b1, center)), radius);
		const ld = sub(l1, l0);

		const qa = dot(ld, ld);
		const qb = 2 * dot(l0, ld);
		const qc = dot(l0, l0) - 1;

		const Δ = qb * qb - 4 * qa * qc;
		if (Δ < 0) {
			return [];
		}
		const t = plusminus(Math.sqrt(Δ))
			.map(sqrt => (-qb + sqrt) / (2 * qa))
			.filter(t => 0 <= t && t <= 1);
		const results = t
			.map(t => ({
				a: inverseAngleMap(startAngle, deltaAngle, (arg(lerp(l0, l1, t)))),
				b: t,
				pos: fb(t),
			}))
			.filter((x): x is { a: number; b: number; pos: Vector; } => !!x.a);

		if (Δ === 0 && results.length) {
			return [results[0]];
		}
		return results;
	}
	throw new Error(`???`);
}
const inverseAngleMap = (x0: number, dx: number, x: number): number | null => {
	// xx = (x0 - x)/τ
	// x0 + t * dx ≡ x (mod τ), t ∈ [0, 1]
	// t = (x - x0 + kτ) / dx

	// dx > 0:
	// xx ≤ k ≤ dx/τ + xx

	// dx < 0:
	// xx ≥ k ≥ dx/τ + xx

	const leftBound = (x0 - x) / TAU;
	const rightBound = leftBound + dx / TAU;

	const lowerBound = Math.min(leftBound, rightBound);
	const upperBound = Math.max(leftBound, rightBound);

	const k = Math.ceil(lowerBound);
	if (k > upperBound) return null;

	return (x - x0 + k * TAU) / dx;
}
const intersectLines = (a0: Vector, a1: Vector, b0: Vector, b1: Vector) => {
	const d12 = sub(a0, a1);
	const d13 = sub(a0, b0);
	const d34 = sub(b0, b1);
	const ta = +det(mat(d13, d34)) / det(mat(d12, d34));
	const tb = -det(mat(d12, d13)) / det(mat(d12, d34));

	return { ta, tb };
}
const plusminus = (x: number) => [x, -x];
// #endregion

const reverseCommands = (commands: Command[]): Command[] => {
	const last = commands.at(-1);
	if (!last) throw new Error("Expected segment to be non-empty");
	return commands.toReversed().map(command => reverseCommand(command));
};
const reverseCommand = (command: Command): Command => {
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
			const { startAngle, deltaAngle, endAngle } = command;
			return {
				...command,
				...positions,
				startAngle: endAngle,
				deltaAngle: -deltaAngle,
				endAngle: startAngle,
			} satisfies CommandArc;
	}
};
const offsetCommand = (
	command: Command,
	/** offset, to the left */
	offset: number
): Command[] => {
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
			const { radius, rotation, center, startAngle, deltaAngle, endAngle } = command;
			const { clockwise } = toSVGArc(command);
			if (radius[0] === radius[1]) {
				// circle
				const r = radius[0] + (clockwise ? offset : -offset);

				const start = add(center, polar(startAngle, r));
				const end = add(center, polar(endAngle, r));

				return [{
					type: "arc",
					start, end,
					radius: vec(Math.abs(r)),
					center,
					rotation,
					startAngle, deltaAngle, endAngle,
				} satisfies CommandArc];
			}
			// ellipse :despair:
			return [command];
	}
};
const sliceCommands = (commands: Command[], start: number, end: number): Command[] => {
	if (commands.length === 1) {
		return [...sliceCommand(commands[0], start, end)];
	}
	const [first, last, rest] = ends(commands);
	return [
		...sliceCommand(first, start, 1),
		...rest,
		...sliceCommand(last, 0, end),
	];
}

export type StrokeCap = (
	| "butt"
	| "round"
);
export type StrokeJoin = (
	| "round"
	| {
		/** miter limit */
		miter: number
	}
);
export type StrokeOptions = {
	join: StrokeJoin;
	capStart: StrokeCap;
	capEnd: StrokeCap;

	widthLeft: number;
	widthRight: number;
};
export type CapOptions = {
	cap: StrokeCap;

	widthLeft: number;
	widthRight: number;
};
export type JoinOptions = {
	join: StrokeJoin;

	width: number;
};
// I know this is named kinda ambiguously, but just remember Offset is an adj.
export type OffsetCommand = [forward: Command[], reverse: Command[]];

export const stroke = (options: StrokeOptions, commands: Command[]): Command[] => {
	const reversedCommands = commands.map(reverseCommand);
	const [first,] = ends(commands);
	const [, last] = ends(reversedCommands);

	const offsetLeft = commands.map(c => offsetCommand(c, options.widthLeft));
	const offsetRight = reversedCommands.map(c => offsetCommand(c, options.widthRight));

	const [offsetLeftFirst, offsetLeftLast] = ends(offsetLeft);
	const [offsetRightFirst, offsetRightLast] = ends(offsetRight);

	const capOptionsEnd = { cap: options.capEnd, widthLeft: options.widthLeft, widthRight: options.widthRight, };
	const capStart = capOffsetCommand(capOptionsEnd, last, offsetLeftLast, offsetRightLast);
	const capOptionsStart = { cap: options.capStart, widthLeft: options.widthRight, widthRight: options.widthLeft, };
	const capEnd = capOffsetCommand(capOptionsStart, first, offsetRightFirst, offsetLeftFirst);

	const joinOptionsLeft = { join: options.join, width: options.widthLeft, };
	const joinOptionsRight = { join: options.join, width: options.widthRight, };

	const joinsLeft = tuples(transposeTuples([commands, offsetLeft]), 2).map(([[from, fromLeft], [to, toLeft]], i) =>
		joinOffsetCommandPair(joinOptionsLeft, from, fromLeft, to, toLeft, `left_${i}`),
	);
	const joinsRight = tuples(transposeTuples([reversedCommands, offsetRight]), 2).map(([[to, toRight], [from, fromRight]], i) =>
		joinOffsetCommandPair(joinOptionsRight, from, fromRight, to, toRight, `right_${i}`),
	);

	const offsetLeftSliced = offsetLeft.map((commands, i) =>
		sliceCommands(commands, joinsLeft[i - 1]?.sliceNext ?? 0, joinsLeft[i]?.slicePrev ?? 1)
	);
	const offsetRightSliced = offsetRight.map((commands, i, a) =>
		sliceCommands(commands, joinsRight[i]?.sliceNext ?? 0, joinsRight[i - 1]?.slicePrev ?? 1)
	);

	return [
		interleave(
			offsetLeftSliced,
			joinsLeft.map(d => d.join),
		).flat(),
		capEnd,
		interleave(
			offsetRightSliced,
			joinsRight.map(d => d.join),
		).flat(),
		capStart,
	].flat();
}
const ends = <T>(a: T[]): [first: T, last: T, rest: T[],] => (a.length < 1
	? (() => { throw new Error("cannot pop empty array") })()
	: [a[0], a.at(-1)!, a.slice(1, -1),]
);
const endsMapped = <T>(as: T[][]): [firsts: T[], lasts: T[], rests: T[][],] => {
	const p = as.map(ends);
	return [
		p.map(([x, ,]) => x),
		p.map(([, x,]) => x),
		p.map(([, , x]) => x),
	];
}

type JoinOffsetCommandPairData = {
	/** May be empty */
	join: Command[];
	slicePrev: number;
	sliceNext: number;
};
export const joinOffsetCommandPair = (
	options: JoinOptions,
	prev: Command,
	prevOffset: Command[],
	next: Command,
	nextOffset: Command[],
	debugPhase?: string,
): JoinOffsetCommandPairData => {
	if ([prevOffset, nextOffset].some(a => a.length === 0))
		throw new RangeError(`Cannot join offset command pair because at least one of the inputs is [].`);

	const [, prevCommand] = ends(prevOffset);
	const [nextCommand,] = ends(nextOffset);
	const { end: start } = prevCommand;
	const { start: end } = nextCommand;
	const vertex = prev.end;

	if (equal(start, end)) return {
		join: [],
		slicePrev: 1,
		sliceNext: 0,
	};

	const prevTangent = commandTangent(prevCommand)(1);
	const nextTangent = commandTangent(nextCommand)(0);

	const tangentsParallel = parallel(prevTangent, nextTangent);

	const intersections = intersectCommands(prevCommand, nextCommand, debugPhase);
	const intersection: IntersectionData | undefined = intersections.toSorted((a, b) => a.b - a.a)[0];

	const slicePrev = intersection?.a ?? 1;
	const sliceNext = intersection?.b ?? 0;

	const common = {
		slicePrev,
		sliceNext,
	};
	if (intersection) return { join: [], slicePrev, sliceNext, };

	switch (options.join) {
		case "round": {
			return {
				join: [
					fromSVGArc({
						start,
						end,
						radius: vec(options.width),
						rotation: 0,
						clockwise: true,
						largeArc: false,
					})
				],
				slicePrev,
				sliceNext,
			};
		}
		default: {
			if ("miter" in options.join) {
				const miterLimit = options.join.miter;

				if (tangentsParallel) {
					const a = add(start, mul(prevTangent, miterLimit));
					const b = add(end, mul(prevTangent, miterLimit));
					return {
						join: [
							{
								type: "line",
								start,
								end: a,
							},
							{
								type: "line",
								start: a,
								end: b,
							},
							{
								type: "line",
								start: b,
								end,
							},
						],
						...common,
					};
				}

				const { ta: tPrev, tb: tNext } = intersectLines(start, add(start, prevTangent), end, add(end, nextTangent));

				if (tPrev < 0 || tNext > 0) {
					// requires going backwards onto the offsets
					return {
						join: [
							{
								type: "line",
								start,
								end: vertex,
							},
							{
								type: "line",
								start: vertex,
								end,
							},
						],
						...common,
					}
				}

				const angle = angleBetween(prevTangent, nextTangent);
				const miterRatio = Math.abs(1 / Math.sin((Math.PI - angle) / 2));

				const point = add(start, mul(prevTangent, tPrev));

				if (miterRatio > miterLimit) {
					const ratio = miterLimit / miterRatio;
					const a = add(start, mul(prevTangent, tPrev * ratio));
					const b = add(end, mul(nextTangent, tNext * ratio));
					return {
						join: [
							{
								type: "line",
								start,
								end: a,
							},
							{
								type: "line",
								start: a,
								end: b,
							},
							{
								type: "line",
								start: b,
								end,
							},
						],
						...common,
					};
				}
				return {
					join: [
						{
							type: "line",
							start,
							end: point,
						},
						{
							type: "line",
							start: point,
							end,
						},
					],
					...common,
				};
			}
		}
	}
	throw new Error("missing handling");
}

const capOffsetCommand = (
	options: CapOptions,
	command: Command,
	prev: Command[],
	next: Command[],
): Command[] => {
	const [, prevCommand] = ends(prev);
	const [nextCommand] = ends(next);
	const start = prevCommand.end;
	const end = nextCommand.start;
	const vertex = command.start;

	const direction = commandTangent(prevCommand)(1);
	const dirAngle = arg(direction);

	switch (options.cap) {
		case "butt": {
			return [
				{
					type: "line",
					start,
					end,
				},
			];
		}
		case "round": {
			const leftCollapsed = options.widthLeft === 0;
			const rightCollapsed = options.widthRight === 0;
			const lineCollapsed = options.widthLeft === options.widthRight;

			const left = add(vertex, mul(direction, options.widthLeft));
			const right = add(vertex, mul(direction, options.widthRight));

			return [
				...leftCollapsed ? [] : [{
					type: "arc",
					start,
					end: left,
					center: vertex,
					radius: vec(options.widthLeft),
					rotation: 0,
					startAngle: dirAngle - HALF_PI,
					deltaAngle: HALF_PI,
					endAngle: dirAngle,
				}] satisfies Command[],
				...lineCollapsed ? [] : [{
					type: "line",
					start: left,
					end: right,
				}] satisfies Command[],
				...rightCollapsed ? [] : [{
					type: "arc",
					start: right,
					end,
					center: vertex,
					radius: vec(options.widthRight),
					rotation: 0,
					startAngle: dirAngle,
					deltaAngle: HALF_PI,
					endAngle: dirAngle + HALF_PI,
				}] satisfies Command[],
			];
		}
	}
}

export type Log = (
	| Command
	| Vector
	| {
		at: Vector;
		content:
		| number
		| string;
	}
);

// debug logging
const logs: Map<string, Log> = new Map();
export function log(things: Record<string, Log>) {
	for (const i in things) {
		const key = logs.has(i)
			? `${i}_${crypto.randomUUID().slice(0, 4)}`
			: i;
		logs.set(key, things[i]);
	}
}
export const clearLogs = () => {
	const copy = new Map([...logs]);
	logs.clear();
	return copy;
}