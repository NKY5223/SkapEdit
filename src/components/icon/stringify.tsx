import { Fragment, ReactNode, SVGAttributes } from "react";
import { Command, Log, toSVGArc } from "./math.ts";
import { add, equal, isVec, lerp, matMul, mul, norm, orthMat, polar, rotMat, sub, vec, Vector, zeroVec } from "./vector.ts";

const drawDot = (pos: Vector, r: number = 0.2) => `
	M ${pos}
	m ${r} 0
	a ${r} ${r} 0 0 0 ${-2 * r} 0
	a ${r} ${r} 0 0 0 ${2 * r} 0
`.replaceAll(/\s+/g, " ").trim();
const drawArrow = (pos: Vector, direction: Vector, size: number = 0.3) => {
	if (equal(direction, zeroVec)) return ``;

	const fw = norm(direction, size);
	const coord = orthMat(fw);

	const h = vec(.5, 0);
	const l = vec(-.5, 1);
	const r = vec(-.5, -1);

	const head = add(pos, matMul(coord, h));
	const left = add(pos, matMul(coord, l));
	const right = add(pos, matMul(coord, r));

	return `
		M ${left}
		L ${head}
		L ${right}
	`.replaceAll(/\s+/g, " ").trim();
};
const stringifyCommand = (command: Command): string => {
	const { end } = command;
	switch (command.type) {
		case "line":
			return `L ${end}`;
		case "arc":
			const { radius, rotation } = command;
			const { largeArc, clockwise } = toSVGArc(command);
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
			if (equal(d, zeroVec)) return [
				dotStart,
				{
					type: `${type}_path`,
					d: `M ${start} L ${end}`,
				},
				dotEnd,
			];
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
			const { radius, rotation, center, startAngle, deltaAngle } = command;
			const { largeArc, clockwise } = toSVGArc(command);
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
export const ALL_COMMANDS = Symbol("*");
export const stringify = (commands: Command[]) => {
	const stringified: string[] = commands.reduce<{ pos: Vector, strs: string[] }>(({ pos, strs }, command) => {
		const { start } = command;
		return {
			pos,
			strs: [...strs,
			// Connect disconnected commands
			`L ${start}`,
			stringifyCommand(command)
			]
		};
	}, { pos: vec(NaN), strs: [] }).strs;
	const debug = commands.map(debugStringifyCommand).flat();

	return [
		stringified.join(" "),
		Object.assign(Object.fromEntries(Object.entries(
			Object.groupBy(debug, ({ type }) => type))
			.map(([k, v]) => [k, v?.map(c => c.d).join(" ")])
		), { [ALL_COMMANDS]: debug.map(({ d }) => d).join(" ") })
	] as const;
};
export const debug = (logs: Map<string, Log>): ReactNode[] => {
	const strokeProps: SVGAttributes<{}> = {
		fill: "none",
		stroke: "#0f0",
		strokeWidth: 0.2,
	};
	const textbgProps: SVGAttributes<{}> = {
		stroke: "#0004",
		strokeWidth: 0.3,
		fontSize: 0.75,
	};
	const textfgProps: SVGAttributes<{}> = {
		fill: "#ff0",
		fontSize: 0.75,
	};
	return [...logs].map<ReactNode>(([k, v]) => {
		if (isVec(v)) {
			const pos = add(v, 0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={drawDot(v)}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		if ("at" in v) {
			const pos = add(v.at, 0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={drawDot(v.at, 0.1)}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		if ("type" in v) {
			const d = debugStringifyCommand(v).map(({d}) => d).join(" ");
			const pos = add(v.start, 0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={d}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		return [];
	}).flat();
}