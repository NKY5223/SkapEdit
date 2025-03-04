import { FC } from "react";
import { M, fill, circle, A, a, h, V, v, l, L } from "./constructors.tsx";
import { Command, arcInfo, joinStrokes, capStroke, stroke, joinStrokesLooped } from "./math.ts";
import { add, equal, leftMat, lerp, mag, matMul, mul, norm, polar, rotMat, sub, vec, Vector } from "./vector.ts";

const drawDot = (pos: Vector, r: number = 0.3) => `
	M ${pos}
	m ${r} 0
	a ${r} ${r} 0 0 0 ${-2 * r} 0
	a ${r} ${r} 0 0 0 ${2 * r} 0
`.replaceAll(/\s+/g, " ").trim();
const drawArrow = (pos: Vector, direction: Vector, size: number = 0.3) => {
	const fw = mul(norm(direction), vec(size));
	const lt = matMul(leftMat, fw);

	const h = [.5, 0];
	const l = [-.5, 1];
	const r = [-.5, -1];

	const head = add(pos, mul(fw, vec(h[0])), mul(lt, vec(h[1])));
	const left = add(pos, mul(fw, vec(l[0])), mul(lt, vec(l[1])));
	const right = add(pos, mul(fw, vec(r[0])), mul(lt, vec(r[1])));

	return `
		M ${left}
		L ${head}
		L ${right}
	`.replaceAll(/\s+/g, " ").trim();
};
const stringifyCommand = (command: Command): string => {
	const { start, end } = command;
	switch (command.type) {
		case "line":
			return `L ${end}`;
		case "arc":
			const { radius, rotation, largeArc, clockwise } = command;
			return `A ${radius} ${rotation} ${+largeArc} ${+clockwise} ${end}`;
	}
};
const debugStringifyCommand = (command: Command): { type: string; d: string; }[] => {
	const { type, start, end } = command;
	const dotStart = {
		type: `${type}_start`,
		d: drawDot(start)
	};
	const dotEnd = {
		type: `${type}_end`,
		d: drawDot(end)
	};
	const d = sub(end, start);


	switch (type) {
		case "line": {
			return [
				dotStart,
				{
					type: `${type}_path`,
					d: `M ${start} L ${end}`,
				},
				{
					type: `${type}_arrow`,
					d: drawArrow(
						lerp(start, end, 0.5),
						d
					)
				},
				dotEnd
			];
		}
		case "arc": {
			const { radius, rotation, largeArc, clockwise } = command;
			const { center, startAngle, deltaAngle } = arcInfo(command);
			const arrowAngle = startAngle + deltaAngle / 2;

			const rot = rotMat(rotation);
			const arrowPos = add(center, matMul(rot, mul(radius, polar(arrowAngle))));

			const sign = clockwise ? -1 : 1;
			/** darrowPos/darrowAngle */
			const direction = mul(vec(sign), matMul(rot, mul(radius, polar(arrowAngle - Math.PI / 2))));

			return [
				dotStart,
				{
					type: `${type}_path`,
					d: `M ${start} A ${radius} ${rotation} ${+largeArc} ${+clockwise} ${end}`,
				},
				{
					type: `${type}_arrow`,
					d: drawArrow(arrowPos, direction),
				},
				{
					type: `${type}_end`,
					d: drawDot(end),
				},
				dotEnd
			];
		}
	}
};
const stringify = (commands: Command[]) => {
	const debug = commands.map(debugStringifyCommand).flat();
	const stringified: string[] = commands.reduce<{ pos: Vector, strs: string[] }>(({ pos, strs }, command) => {
		const { start } = command;
		const move = mag(sub(start, pos)) <= 0.00001 ? [] : [`M ${start}`];
		return {
			pos,
			strs: [...strs, ...move, stringifyCommand(command)]
		};
	}, { pos: vec(NaN), strs: [] }).strs;
	return [
		stringified.join(" "),
		Object.fromEntries(Object.entries(
			Object.groupBy(debug, ({ type }) => type))
			.map(([k, v]) => [k, v?.map(c => c.d).join(" ")])
		)
	] as const;
};

export const DebugNewIcon: FC = () => {
	const shape = (
		capStroke(
			{ start: "join", end: "join" },
			joinStrokes("join", [
				stroke({
					join: "join",
					widthLeft: 1,
					widthRight: 1,
				}, [
					M(6, 18),
					// a(12, 12, 0, false, true, 12, 12),
					// h(-12),
					v(-12),
				].flat()),
				stroke({
					join: "join",
					widthLeft: 1,
					widthRight: 1,
				}, [
					l(15, 0),
					L(6, 18),
				].flat())
			])
		)
	);
	const [d, debug] = stringify(shape);
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
};
