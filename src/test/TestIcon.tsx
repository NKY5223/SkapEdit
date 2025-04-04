import { FC, SVGAttributes } from "react";
import { FormSection } from "../components/form/FormSection.tsx";
import { useNumberInput } from "../components/form/NumberInput.tsx";
import { useTextInput } from "../components/form/TextInput.tsx";
import { M, L, a } from "../components/icon/constructors.tsx";
import { stroke, clearLogs } from "../components/icon/math.ts";
import { stringifyPath, debug, ALL_COMMANDS } from "../components/icon/stringify.tsx";
import { ViewFC } from "../components/layout/LayoutView.tsx";

export const TestIcon: ViewFC = ({
	children,
}) => {
	const [widthLeft, widthLeftInput] = useNumberInput(1, { label: "Width Left", min: 0, step: 0.25, });
	const [widthRight, widthRightInput] = useNumberInput(1, { label: "Width Right", min: 0, step: 0.25, });
	const [radius, radiusInput] = useNumberInput(2, { label: "Radius", min: 2, step: 0.25, });
	const [startX, startXInput] = useNumberInput(7, { label: "Start X", step: 0.5, });
	const [startY, startYInput] = useNumberInput(3, { label: "Start Y", step: 0.5, });
	const [testStr, testStrInput] = useTextInput("test\ttest", { maxLength: 100 });

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


	const [, debugStroked] = stringifyPath(stroked);
	const [, debugOriginal] = stringifyPath(original);
	const logs = debug(clearLogs());
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
			{children}
			<FormSection>
				<FormSection row>
					{widthLeftInput}
					{widthRightInput}
				</FormSection>
				<FormSection row>
					{startXInput}
					{startYInput}
				</FormSection>
				{radiusInput}
				{testStrInput}
			</FormSection>
			<span>{testStr}</span>

			<svg viewBox="0 0 24 24" width="480" height="480" style={{ border: "1px solid lime" }}>
				{/* <path d={d} fill="#0004" /> */}
				<path {...props} d="M0 12 h24 M12 0 v24 M13 12 a1 1 0 0 0 -2 0 1 1 0 0 0 2 0"
					stroke="#fff" strokeWidth={1 * 24 / 480} strokeOpacity={0.25} />
				<path {...props} d={debugOriginal[ALL_COMMANDS]} stroke="oklch(1 0 0)" />

				<path {...props} d={debugStroked.line_start} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_path} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_arrow} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_end} stroke="oklch(.6 .3 40)" />

				<path {...props} d={debugStroked.arc_start} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_path} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_arrow} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_end} stroke="oklch(.6 .3 250)" />

				{logs}
			</svg>
		</div>
	);
};
