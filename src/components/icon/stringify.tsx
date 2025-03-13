import { FC, SVGAttributes } from "react";
import { M, a, L, l } from "./constructors.tsx";
import { clearLogs, Command, log, stroke, toSVGArc } from "./math.ts";
import { add, equal, isVec, lerp, matMul, mul, norm, orthMat, polar, rotMat, sub, vec, Vector, zeroVec } from "./vector.ts";
import { useNumberInput } from "../form/NumberInput.tsx";
import { FormSection } from "../form/FormSection.tsx";

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
const ALL = Symbol("*");
const stringify = (commands: Command[]) => {
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
		), { [ALL]: debug.map(({ d }) => d).join(" ") })
	] as const;
};
const debug = (logs: ReturnType<typeof clearLogs>): string => {
	return logs.map<string[]>(v => {
		if (isVec(v)) return [drawDot(v)];
		return debugStringifyCommand(v).map(v => v.d);
	}).flat().join(" ");
}

export const DebugNewIcon: FC = () => {
	const [widthLeft, widthLeftInput] = useNumberInput(1, { label: "Width Left", min: 0, step: 0.25, });
	const [widthRight, widthRightInput] = useNumberInput(1, { label: "Width Right", min: 0, step: 0.25, });
	const [radius, radiusInput] = useNumberInput(2, { label: "Radius", min: 2, step: 0.25, });
	const [startX, startXInput] = useNumberInput(7, { label: "Start X", step: 0.5, });
	const [startY, startYInput] = useNumberInput(3, { label: "Start Y", step: 0.5, });

	M(startX, startY);
	const first = L(12, 6)[0];
	const second = a(radius, radius, 0, false, true, 0, radius * 2)[0];
	const original = [first, second];
	const stroked = stroke({
		join: "round",
		capStart: "round",
		capEnd: "round",
		widthLeft,
		widthRight,
	}, original);

	const logs = clearLogs();

	const [, debugStroked] = stringify(stroked);
	const [, debugOriginal] = stringify(original);
	const strLogs = debug(logs);
	const props: SVGAttributes<{}> = {
		strokeWidth: 1.5 * 24 / 480,
		strokeOpacity: 1,
		fill: "none",
	};
	return (
		<div style={{
			display: "grid",
			gap: ".5em",
			padding: ".5em",
		}}>
			<FormSection>
				{widthLeftInput}
				{widthRightInput}
				{radiusInput}
				{startXInput}
				{startYInput}
			</FormSection>

			<svg viewBox="0 0 24 24" width="480" height="480" style={{ border: "1px solid lime" }}>
				{/* <path d={d} fill="#0004" /> */}
				<path {...props} d="M0 12 h24 M12 0 v24 M13 12 a1 1 0 0 0 -2 0 1 1 0 0 0 2 0"
					stroke="#fff" strokeWidth={1 * 24 / 480} strokeOpacity={0.25} />
				<path {...props} d={debugOriginal[ALL]} stroke="oklch(1 0 0)" />

				<path {...props} d={debugStroked.line_start} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_path} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_arrow} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_end} stroke="oklch(.6 .3 40)" />

				<path {...props} d={debugStroked.arc_start} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_path} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_arrow} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_end} stroke="oklch(.6 .3 250)" />

				<path {...props} d={strLogs} stroke="oklch(.6 .7 150)" strokeWidth={3 * 24 / 480} strokeOpacity={1} />
			</svg>
		</div>
	);
};
