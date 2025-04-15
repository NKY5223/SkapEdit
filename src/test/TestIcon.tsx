import { FormSection } from "@components/form/FormSection.tsx";
import { splitsRaw } from "@components/icon/icon/split.ts";
import { clearLogs } from "@components/icon/math.ts";
import { ALL_COMMANDS, debug, stringifyPath } from "@components/icon/stringify.tsx";
import { ViewFC } from "@components/layout/LayoutView.tsx";
import { SVGAttributes } from "react";

export const TestIcon: ViewFC = ({
	children,
}) => {
	const path = splitsRaw.x;

	const [d, debugInfo] = stringifyPath(path);

	const logs = debug(clearLogs());

	const strokeScale = 24 / 480;
	const props: SVGAttributes<{}> = {
		strokeWidth: 1.5 * strokeScale,
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
			</FormSection>

			<span>
				Lorem Ipsum
				<svg viewBox="0 0 24 24" width="1.5em" height="1.5em" style={{
					verticalAlign: "middle",
					outline: "1px solid #f004",
				}}>
					<path d={d} fill="currentColor" />
				</svg>
				Lorem Ipsum
			</span>

			<svg viewBox="0 0 24 24" width="480" height="480" style={{ border: "1px solid lime" }}>
				<path {...props}
					stroke="#fff" strokeWidth={1 * strokeScale} opacity={0.25}
					d="M 2 2 L 22 2 M 2 6 L 22 6 M 2 12 L 22 12 M 2 18 L 22 18 M 2 22 L 22 22 M 2 2 L 2 22 M 6 2 L 6 22 M 12 2 L 12 22 M 18 2 L 18 22 M 22 2 L 22 22"
				/>
				<path {...props} d={d} stroke="oklch(1 0 0)" />
				<path {...props} d={debugInfo[ALL_COMMANDS]} stroke="oklch(1 0 0)" />

				{/* <path {...props} d={debugStroked.line_start} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_path} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_arrow} stroke="oklch(.6 .3 40)" />
				<path {...props} d={debugStroked.line_end} stroke="oklch(.6 .3 40)" />

				<path {...props} d={debugStroked.arc_start} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_path} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_arrow} stroke="oklch(.6 .3 250)" />
				<path {...props} d={debugStroked.arc_end} stroke="oklch(.6 .3 250)" /> */}
				<g>
					{logs}
				</g>
			</svg>
		</div>
	);
};
