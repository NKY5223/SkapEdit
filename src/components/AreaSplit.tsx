import { useRef, useState } from "react";
import "./AreaSplit.css";

export type AreaSplitAxis = "x" | "y";

export function Area({ children: child }: { children: [React.ReactNode] }) {
	return <div className="area">{child}</div>;
}

export function AreaSplit({ axis, split: initialSplit, clampSplit = 0.1, children: [child0, child1] }:
	{
		/**
		 * Axis to split on. 
		 * - "y" splits vertically (日)
		 * - "x" splits horizontally (◫)
		 */
		axis: AreaSplitAxis,
		/**
		 * How much space the left/top child initially takes, in [0, 1]
		 */
		split: number,
		/**
		 * How small child elements can get, in [0, 1]
		 */
		clampSplit?: number,
		children: [React.ReactNode, React.ReactNode]
	}
) {
	const [split, setSplit] = useState(initialSplit);
	const [resizing, setResizing] = useState(false);
	const areaSplitElement = useRef<HTMLDivElement>(null);

	clampSplit = clamp(clampSplit, 0, 1);
	const clampMin = clampSplit;
	const clampMax = 1 - clampSplit;

	const move: React.MouseEventHandler<HTMLDivElement> = e => {
		if (!resizing) return;
		if (!e.buttons) {
			setResizing(false);
			return;
		}
		const el = areaSplitElement.current;
		if (!el) return;

		const { top, left, width, height } = el.getBoundingClientRect();
		const mouse = pickAxis(axis, e.clientX, e.clientY);
		const pos = pickAxis(axis, left, top);
		const size = pickAxis(axis, width, height);

		const result = clamp((mouse - pos) / size, clampMin, clampMax);
		setSplit(result);

		// console.log("resizing:", { mouse, pos, size, result });
	}

	return <div className={`area-split axis-${axis}`} style={{ "--split": `${split}fr`, "--inverse-split": `${1 - split}fr` }}
		onMouseMove={move} onMouseUp={() => setResizing(false)} ref={areaSplitElement}>
		<div className="area-split-0">{child0}</div>
		<div className={`area-resize axis-${axis}`} onMouseDown={() => setResizing(true)}>
			<div className="area-resize-region"></div>
		</div>
		<div className="area-split-1">{child1}</div>
	</div>
}
function pickAxis<T>(axis: AreaSplitAxis, x: T, y: T): T {
	return axis === "x" ? x : y;
}
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), max);