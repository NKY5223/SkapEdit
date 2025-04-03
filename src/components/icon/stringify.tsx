import { Fragment, ReactNode, SVGAttributes } from "react";
import { Command, Log, toSVGArc } from "./math.ts";
import { orth, polar, rotationMat, vec2, Vec2, zero } from "../../common/vec2.ts";
import { Vector } from "../../common/vectorN.ts";

const d = (template: readonly string[], ...subst: (Vec2 | number)[]) => (
	String.raw({ raw: template }, ...subst.map(v => 
		typeof v === "number" ? v.toString() :
		v instanceof Vector ? `${v[0]} ${v[1]}` : ""
	)).replaceAll(/\s+/g, " ").trim()
);
const drawDot = (pos: Vec2, r: number = 0.2) => d`
	M ${pos}
	m ${r} 0
	a ${r} ${r} 0 0 0 ${-2 * r} 0
	a ${r} ${r} 0 0 0 ${2 * r} 0
`;
const drawArrow = (pos: Vec2, direction: Vec2, size: number = 0.3) => {
	if (direction.equal(zero)) return ``;

	const fw = direction.norm(size);
	const coord = orth(fw);

	const h = vec2(.5, 0);
	const l = vec2(-.5, 1);
	const r = vec2(-.5, -1);

	const head = pos.add(coord.mul(h));
	const left = pos.add(coord.mul(l));
	const right = pos.add(coord.mul(r));

	return d`
		M ${left}
		L ${head}
		L ${right}
	`;
};
const stringifyCommand = (command: Command): string => {
	const { end } = command;
	switch (command.type) {
		case "line":
			return d`L ${end}`;
		case "arc":
			const { radius, rotation } = command;
			const { largeArc, clockwise } = toSVGArc(command);
			return d`A ${radius} ${rotation} ${+largeArc} ${+clockwise} ${end}`;
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
	const d = end.sub(start);

	switch (type) {
		case "line": {
			if(d.equal(zero)) return [
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
						Vector.lerp(start, end)(0.5),
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

			const rot = rotationMat(rotation);
			const arrowPos = center.add(rot.mul(radius.mul(polar(arrowAngle))));

			const sign = clockwise ? -1 : 1;
			/** darrowPos/darrowAngle */
			const direction = rot.mul(radius.mul(polar(arrowAngle - Math.PI / 2))).mul(sign);

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
	const stringified: string[] = commands.reduce<{ pos: Vec2, strs: string[] }>(({ pos, strs }, command) => {
		const { start } = command;
		return {
			pos,
			strs: [...strs,
			// Connect disconnected commands
			`L ${start}`,
			stringifyCommand(command)
			]
		};
	}, { pos: vec2(NaN), strs: [] }).strs;
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
		if (v instanceof Vector) {
			const pos = v.add(0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={drawDot(v)}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		if ("at" in v) {
			const pos = v.at.add(0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={drawDot(v.at, 0.1)}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		if ("type" in v) {
			const d = debugStringifyCommand(v).map(({d}) => d).join(" ");
			const pos = v.start.add(0.5);
			return <Fragment key={k}>
				<path {...strokeProps} d={d}></path>,
				<text {...textbgProps} x={pos[0]} y={pos[1]}>{k}</text>
				<text {...textfgProps} x={pos[0]} y={pos[1]}>{k}</text>
			</Fragment>;
		}
		return [];
	}).flat();
}