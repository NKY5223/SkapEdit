
/*
goal:
svg-like paths with	custom stroking, intersection, etc
*/

import { FC } from "react";

// #region Command types
type CommandBase<T extends string> = {
	type: T;
	relative: boolean;
	/** Pen position after this command. Set to null for no update. */
	x: number | null;
	/** Pen position after this command. Set to null for no update. */
	y: number | null;
};

export type CommandMove = CommandBase<"move"> & {
	x: number;
	y: number;
};
export type CommandLine = CommandBase<"line">;
export type CommandArc = CommandBase<"arc"> & {
	rx: number;
	ry: number;

	rotation: number;
	largeArc: boolean;
	clockwise: boolean;

	x: number;
	y: number;
};
export type Command = (
	| CommandMove
	| CommandLine
	| CommandArc
);
// #endregion
type Segment = Command[];

// #region Stroke types
type StrokeBase<T extends string> = {
	type: T;
	segment: Segment;
}

type StrokeCap = null;
type StrokeJoin = null;
type Stroke = StrokeBase<"stroke"> & {
	widthLeft: number;
	widthRight: number;

	startCap: StrokeCap;
	join: StrokeJoin;
	endCap: StrokeCap;
};
type Fill = StrokeBase<"fill">;
type StrokeData = (
	| Stroke
	| Fill
);

// #endregion
type Path = StrokeData[];

// #region absolute types
type AbsC<T extends Command> = T extends T ? Omit<T, "x" | "y" | "relative"> & {
	x: number; y: number;
	startX: number; startY: number;
} : never;
type AbsoluteCommand = AbsC<Command>;
type AbsoluteSegment = AbsoluteCommand[];
type AbsS<T extends StrokeData> = T extends T ? Omit<T, "segment"> & { segment: AbsoluteSegment; } : never;
type AbsoluteStrokeData = AbsS<StrokeData>;
type AbsolutePath = AbsoluteStrokeData[];
// #endregion

// #region constructors
const move = (x: number, y: number, relative = false): CommandMove => ({
	type: "move",
	relative,
	x, y,
});
const line = (x: number, y: number, relative = false): CommandLine => ({
	type: "line",
	relative,
	x, y,
});
const horizontal = (x: number, relative = false): CommandLine => ({
	type: "line",
	relative,
	x, y: null,
});
const vertical = (y: number, relative = false): CommandLine => ({
	type: "line",
	relative,
	x: null, y,
});
const arc = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, x: number, y: number, relative = false): CommandArc => ({
	type: "arc",
	relative,
	rx, ry,
	rotation,
	largeArc,
	clockwise,
	x, y,
});

export const M = (x: number, y: number) => move(x, y, false);
export const m = (dx: number, dy: number) => move(dx, dy, true);
export const L = (x: number, y: number) => line(x, y, false);
export const l = (dx: number, dy: number) => line(dx, dy, true);
export const H = (x: number) => horizontal(x, false);
export const h = (dx: number) => horizontal(dx, true);
export const V = (y: number) => vertical(y, false);
export const v = (dy: number) => vertical(dy, true);
export const A = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, x: number, y: number) => arc(rx, ry, rotation, largeArc, clockwise, x, y, false);
export const a = (rx: number, ry: number, rotation: number, largeArc: boolean, clockwise: boolean, dx: number, dy: number) => arc(rx, ry, rotation, largeArc, clockwise, dx, dy, true);

export const stroke = ({ width, startCap, join, endCap }: {
	width: number;
	startCap: StrokeCap;
	join: StrokeJoin;
	endCap: StrokeCap;
}, segment: Segment): Stroke => ({
	type: "stroke",
	widthLeft: width / 2,
	widthRight: width / 2,

	startCap,
	join,
	endCap,

	segment,
});
// #endregion

const absolute = (path: Path): AbsolutePath => {
	// much easier than reduce
	let x = 0;
	let y = 0;
	return path.map(stroke => ({
		...stroke,
		segment: stroke.segment.map(command => {
			const start = {
				startX: x,
				startY: y,
			};
			if (!command.relative) {
				const coords = {
					x: command.x ?? x,
					y: command.y ?? y,
				}
				x = coords.x;
				y = coords.y;

				return ({
					...command,
					...coords,
					...start,
				});
			}
			const coords = {
				x: (command.x ?? 0) + x,
				y: (command.y ?? 0) + y,
			};
			x = coords.x;
			y = coords.y;
			return ({
				...command,
				...coords,
				...start,
			});
		})
	}));
}

// cannot use Math.sign() because it can be 0
const sign = (x: number) => Math.sign(x === 0 ? 1/x : x);
const angleBetween = (ux: number, uy: number, vx: number, vy: number) => 
	sign(ux * vy - uy * vx) * Math.acos((ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy)));
const arcInfo = (arc: AbsC<CommandArc>) => {
	const TAU = 2 * Math.PI;
	
	// let startX = r, startY = 0, rx = ry = r, rotation = 0, x = (-r)+, y = 0;
	const { startX, startY, rx, ry, rotation, largeArc, clockwise, x, y } = arc;

	if (rx < 0 || ry < 0) return arcInfo({
		...arc,
		rx: Math.abs(rx),
		ry: Math.abs(ry),
	});

	// cos = 1, sin = 0
	const cos = Math.cos(rotation);
	const sin = Math.sin(rotation);
	// r-
	const diffX = (startX - x) / 2;
	// 0
	const diffY = (startY - y) / 2;
	// 0+
	const midX = (startX + x) / 2;
	// 0
	const midY = (startY + y) / 2;

	// r-
	const x1Prime = cos * diffX + sin * diffY;
	// 0
	const y1Prime = -sin * diffX + cos * diffY;

	const Lambda = (x1Prime / rx) ** 2 + (y1Prime / ry) ** 2;
	if (Lambda > 1) return arcInfo({
		...arc,
		rx: Math.sqrt(Lambda) * rx,
		ry: Math.sqrt(Lambda) * ry,
	});

	const sign = largeArc !== clockwise ? 1 : -1;
	// alpha can be 0!
	// (r * r-) ** 2 = r⁴-
	const alpha = (rx * y1Prime) ** 2 + (ry * x1Prime) ** 2;
	const cPrime = sign * Math.sqrt(((rx * ry) ** 2 - alpha) / alpha);

	const cxPrime = cPrime * rx * y1Prime / ry;
	const cyPrime = cPrime * -ry * x1Prime / rx;

	const cx = cos * cxPrime + -sin * cyPrime + midX;
	const cy = sin * cxPrime + cos * cyPrime + midY;


	const betaX = (x1Prime - cxPrime) / rx;
	const betaY = (y1Prime - cyPrime) / ry;
	const gammaX = (-x1Prime - cxPrime) / rx;
	const gammaY = (-y1Prime - cyPrime) / ry;
	const startAngle = angleBetween(1, 0, betaX, betaY);
	const endAngle = angleBetween(1, 0, gammaX, gammaY);
	const angleDiff = (endAngle - startAngle) % TAU;
	/* 
		where Δθ is fixed in the range −360° < Δθ < 360° such that:

		if fS = 0, then Δθ < 0,

		else if fS = 1, then Δθ > 0.

		// !!!! i think they meant "then <=, >= 0".
	*/
	const deltaAngle = clockwise
		? angleDiff < 0 ? angleDiff + TAU : angleDiff
		: angleDiff > 0 ? angleDiff - TAU : angleDiff
	;

	console.log(Object.entries({ 
		rx, ry, clockwise, largeArc, startX, startY, x, y, 
		// diffX, diffY, midX, midY,
		// cos, sin,
		// x1Prime, y1Prime,
		// alpha, 
		// cPrime, cxPrime, cyPrime, 
		cx, cy, betaX, betaY, gammaX, gammaY, 
		startAngle, endAngle, angleDiff, deltaAngle 
	}).map(([k, v]) => `${k.padEnd(11, " ")}: ${v}`).join("\n"));

	return {
		cx, cy,
		startAngle, deltaAngle, endAngle
	}
}
const strokeToFill = (stroke: AbsS<Stroke>): AbsoluteSegment => {
	const left = stroke.segment.map(command => offsetCommand(command, stroke.widthLeft)).flat();
	const right = reverseSegment(stroke.segment).map(command => offsetCommand(command, stroke.widthRight)).flat();
	return [
		...left,
		...right,
	];
}
const reverseSegment = (segment: AbsoluteSegment): AbsoluteSegment => {
	const last = segment.at(-1);
	if (!last) throw new Error("Expected segment to be non-empty");
	return [
		{
			type: "move",
			// maybe we should keep track of that
			startX: 0,
			startY: 0,
			x: last.x,
			y: last.y,
		} satisfies AbsC<CommandMove>,
		...segment.toReversed().map(command => reverseCommand(command)),
	];
};
const reverseCommand = (command: AbsoluteCommand): AbsoluteCommand => {
	const positions = {
		startX: command.x,
		startY: command.y,
		x: command.startX,
		y: command.startY,
	};
	switch (command.type) {
		case "move":
			return {
				type: "move",
				...positions,
			} satisfies AbsC<CommandMove>;
		case "line":
			return {
				type: "line",
				...positions,
			} satisfies AbsC<CommandLine>;
		case "arc":
			return {
				type: "arc",
				...positions,
				rx: command.rx,
				ry: command.ry,
				rotation: command.rotation,
				largeArc: command.largeArc,
				clockwise: !command.clockwise,
			} satisfies AbsC<CommandArc>;
	}
}
const offsetCommand = (command: AbsoluteCommand, /** offset, to the left */ offset: number): AbsoluteCommand[] => {
	const { startX, startY, x, y } = command;
	switch (command.type) {
		case "move":
			return [command];
		case "line":
			const dx = x - startX;
			const dy = y - startY;
			const d = Math.hypot(dy, dx);

			const nx = dy / d;
			const ny = -dx / d;

			return [{
				type: "line",
				startX: startX + nx,
				startY: startY + ny,
				x: x + nx,
				y: y + ny,
			} satisfies AbsC<CommandLine>];
		case "arc":
			const { rx, ry, rotation, largeArc, clockwise } = command;
			const { cx, cy, startAngle, endAngle } = arcInfo(command);
			if (rx === ry) {
				// circle
				const r = rx + (clockwise ? offset : -offset);
				const startX = cx + r * Math.cos(startAngle);
				const startY = cy + r * Math.sin(startAngle);
				const endX = cx + r * Math.cos(endAngle);
				const endY = cy + r * Math.sin(endAngle);

				console.log({ r, cx, cy, startAngle, endAngle, startX, startY, endX, endY });

				return [{
					type: "arc",
					startX,
					startY,
					rx: r,
					ry: r,
					rotation,
					largeArc,
					clockwise,
					x: endX,
					y: endY,
				}];
			}
			// ellipse :despair:
			return [command];
	}
}

const stringify = (command: AbsoluteCommand): string => {
	const { x, y } = command;
	switch (command.type) {
		case "move":
			return `M ${x} ${y}`;
		case "line":
			return `L ${x} ${y}`;
		case "arc":
			const { rx, ry, rotation, largeArc, clockwise } = command;
			return `A ${rx} ${ry} ${rotation} ${+largeArc} ${+clockwise} ${x} ${y}`;
	}
}

const dot = (x: number, y: number, r: number = 0.3) => `
	M ${x} ${y}
	m ${r} 0
	a ${r} ${r} 0 0 0 ${-2 * r} 0
	a ${r} ${r} 0 0 0 ${2 * r} 0
`.replaceAll(/\s+/g, " ").trim();
const arrow = (x: number, y: number, dx: number, dy: number, s: number = 0.3) => {
	const d = Math.hypot(dx, dy);
	dx *= s / d;
	dy *= s / d;


	const h = [.5, 0];
	const l = [-.5, 1];
	const r = [-.5, -1];

	// matrix mult [dx -dy | dy dx], + [x y]

	const hx = x + h[0] * dx + h[1] * -dy;
	const hy = y + h[0] * dy + h[1] * +dx;

	const lx = x + l[0] * dx + l[1] * -dy;
	const ly = y + l[0] * dy + l[1] * +dx;

	const rx = x + r[0] * dx + r[1] * -dy;
	const ry = y + r[0] * dy + r[1] * +dx;

	return `
		M ${lx} ${ly}
		L ${hx} ${hy}
		L ${rx} ${ry}
	`.replaceAll(/\s+/g, " ").trim();
};

const debugStringify = (command: AbsoluteCommand): { type: string; d: string; }[] => {
	const { type, startX, startY, x, y } = command;
	const dotStart = {
		type: `${type}_start`,
		d: dot(startX, startY)
	};
	const dotEnd = {
		type: `${type}_end`,
		d: dot(x, y)
	};

	switch (type) {
		case "move": {
			return [
				dotStart, dotEnd
			];
		}
		case "line": {
			const dx = x - startX;
			const dy = y - startY;
			return [
				dotStart,
				{
					type: `${type}_path`,
					d: `M ${startX} ${startY} L ${x} ${y}`,
				},
				{
					type: `${type}_arrow`,
					d: arrow(
						startX + dx * 0.2, startY + dy * 0.2,
						dx, dy,
					)
				},
				dotEnd
			];
		}
		case "arc": {
			const { rx, ry, rotation, largeArc, clockwise } = command;
			const { cx, cy, startAngle, deltaAngle } = arcInfo(command);
			const cosr = Math.cos(rotation);
			const sinr = Math.sin(rotation);
			const angle = startAngle + deltaAngle / 2;
			const cosa = Math.cos(angle);
			const sina = Math.sin(angle);

			const mx = cosr * rx * cosa + -sinr * ry * sina + cx;
			const my = sinr * rx * cosa + +cosr * ry * sina + cy;

			const sign = clockwise ? 1 : -1;
			/** derivative, dx/dangle */
			const tx = (cosr * rx * -sina + -sinr * ry * cosa) * sign;
			const ty = (sinr * rx * -sina + +cosr * ry * cosa) * sign;


			return [
				dotStart,
				{
					type: `${type}_path`,
					d: `M ${startX} ${startY} A ${rx} ${ry} ${rotation} ${+largeArc} ${+clockwise} ${x} ${y}`,
				},
				{
					type: `${type}_arrow`,
					d: arrow(mx, my, tx, ty),
				},
				// {
				// 	type: `${type}_arrow`,
				// 	d: dot(mx, my),
				// },
				// {
				// 	type: `${type}_end`,
				// 	d: dot(mx + tx, my + ty),
				// },
				dotEnd
			];
		}
	}
}

const fix = (path: Path) => {
	const abs = absolute(path);
	const segments = abs.map(stroke => {
		switch (stroke.type) {
			case "stroke":
				return strokeToFill(stroke);
			case "fill":
				return stroke.segment;
		}
	});
	const commands = segments.flat();
	const debug = commands.map(/* () => ({ type: "a", d: "" }),  */debugStringify).flat();
	return [
		commands.map(stringify).join(" "),
		Object.fromEntries(Object.entries(
			Object.groupBy(debug, ({ type }) => type))
			.map(([k, v]) => [k, v?.map(c => c.d).join(" ")])
		)
	] as const;
}

export const NewIconTest: FC = () => {
	const [d, debug] = fix([
		stroke({
			width: 2,
			startCap: null,
			join: null,
			endCap: null,
		}, [
			M(6, 6),
			h(12),
			l(-5, 12),
			h(-12),
			l(5, -12),
			a(12, 12, 0, false, true, 12, 0),
			// a(6, 6, 0, false, true, -11.999999999999999, 0),

			M(16, 6),
			a(6, 6, 0, false, true, -12, 0),
		])
	]);
	return (
		<svg viewBox="0 0 24 24" width="480" height="480" style={{ border: "1px solid lime" }}>
			<path d={d} fill="#0004" />
			<path d={debug.move} stroke="#f00" strokeWidth={.1} fill="none" />

			<path d={debug.line_start} stroke="oklch(.4 .7 70)" strokeWidth={.1} fill="none" />
			<path d={debug.line_path} stroke="oklch(.4 .7 80)" strokeWidth={.1} fill="none" />
			<path d={debug.line_arrow} stroke="oklch(.4 .7 80)" strokeWidth={.1} fill="none" />
			<path d={debug.line_end} stroke="oklch(.4 .7 90)" strokeWidth={.1} fill="none" />

			<path d={debug.arc_start} stroke="oklch(.8 .3 170)" strokeWidth={.1} fill="none" />
			<path d={debug.arc_path} stroke="oklch(.8 .3 180)" strokeWidth={.1} fill="none" />
			<path d={debug.arc_arrow} stroke="oklch(.8 .3 180)" strokeWidth={.1} fill="none" />
			<path d={debug.arc_end} stroke="oklch(.8 .3 190)" strokeWidth={.1} fill="none" />
		</svg>
	);
}

