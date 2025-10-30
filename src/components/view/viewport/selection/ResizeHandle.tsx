import { vec2 } from "@common/vec2.ts";
import { mergeListeners, toClassName } from "@components/utils.tsx";
import { BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { FC } from "react";
import css from "./ActiveSelection.module.css";
import { viewportToMap } from "../mapping.ts";
import { ViewportInfo } from "../Viewport.tsx";

const rounding = 1;

const xName = (x: -1 | 0 | 1) => {
	switch (x) {
		case -1: return "left";
		case 1: return "right";
		default: return null;
	}
}
const yName = (y: -1 | 0 | 1) => {
	switch (y) {
		case -1: return "top";
		case 1: return "bottom";
		default: return null;
	}
}
type ResizeHandleProps = {
	/** -1: left | 0: middle | 1: right */
	x: -1 | 0 | 1;
	/** -1: top | 0: middle | 1: bottom */
	y: -1 | 0 | 1;
	viewportInfo: ViewportInfo;
	onUpdate: (update: BoundsUpdateLRTBWH) => void;
};
export const ResizeHandle: FC<ResizeHandleProps> = ({
	x, y, viewportInfo, onUpdate,
}) => {
	const xn = xName(x);
	const yn = yName(y);
	// Uses || for the case where x === y === 0
	const name = [yn, xn].filter(x => x !== null).join("-") || "middle";

	const { listeners, dragging } = useDrag({
		buttons: MouseButtons.Left,
		onDrag: (curr) => {
			const sub = curr.sub(viewportInfo.viewportPos);
			const normed = viewportToMap(viewportInfo, sub);
			const rounded = vec2(
				Math.round(normed[0] / rounding) * rounding,
				Math.round(normed[1] / rounding) * rounding,
			);

			if (xn || yn) {
				onUpdate({
					...xn ? { [xn]: rounded[0] } : {},
					...yn ? { [yn]: rounded[1] } : {},
				});
			}
		}
	});
	const className = toClassName(
		css["handle"],
		css[name],
		dragging && css["dragging"],
	);
	return (
		<div className={className} {...mergeListeners({
			onPointerDown: e => {
				e.stopPropagation();
			}
		}, listeners)}></div>
	);
}