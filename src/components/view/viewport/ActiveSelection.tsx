import { FC } from "react";
import { useEditorSelection } from "@components/editor/selection.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import css from "./ActiveSelection.module.css";
import { ViewportInfo } from "./Viewport.tsx";
import { viewportToMap } from "./utils.tsx";
import { toClassName } from "@components/utils.tsx";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { vec2 } from "@common/vec2.ts";

const rounding = 1;

type ActiveSelectionProps = {
	viewportInfo: ViewportInfo;
};
export const ActiveSelection: FC<ActiveSelectionProps> = ({
	viewportInfo,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();

	if (!selection) return null;
	const selectedObject = getObject(map, selection);
	if (!selectedObject) return null;

	switch (selectedObject.type) {
		case "obstacle":
		case "lava": {
			const [x, y] = selectedObject.bounds.topLeft;
			const [w, h] = selectedObject.bounds.size;
			const onUpdate = (update: BoundsUpdateLRTBWH) => {
				dispatchMap({
					type: "replace_object",
					targetObject: selectedObject.id,
					replacement: obj => "bounds" in obj ? {
						...obj,
						bounds: obj.bounds.set(update, "prefer-old")
					} : obj
				});
			}
			const props = {
				viewportInfo,
				onUpdate
			};
			return (
				<div className={toClassName(css["selection"], css["rect"])} style={{
					"--x": `${x}px`,
					"--y": `${y}px`,
					"--w": `${w}px`,
					"--h": `${h}px`,
				}}>
					<ResizeHandle x={-1} y={-1} {...props} />
					<ResizeHandle x={+1} y={-1} {...props} />
					<ResizeHandle x={-1} y={+1} {...props} />
					<ResizeHandle x={+1} y={+1} {...props} />

					<ResizeHandle x={+0} y={-1} {...props} />
					<ResizeHandle x={-1} y={+0} {...props} />
					<ResizeHandle x={+1} y={+0} {...props} />
					<ResizeHandle x={+0} y={+1} {...props} />
				</div>
			);
		}
		case "text": {
			const [x, y] = selectedObject.pos;
			return (
				<div className={toClassName(css["selection"], css["circle"])} style={{
					"--x": `${x}px`,
					"--y": `${y}px`,
					"--r": `5px`,
				}}></div>
			);
		}
	}
}

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
const ResizeHandle: FC<ResizeHandleProps> = ({
	x, y, viewportInfo, onUpdate,
}) => {
	const xn = xName(x);
	const yn = yName(y);
	// Uses || for the case where x === y === 0
	const name = [yn, xn].filter(x => x !== null).join("-") || "middle";

	const { handlePointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr) => {
		const sub = curr.sub(viewportInfo.viewportPos);
		const normed = viewportToMap(viewportInfo, sub);
		const rounded = vec2(
			Math.round(normed[0] / rounding) * rounding,
			Math.round(normed[1] / rounding) * rounding,
		)
		
		if (xn) {
			onUpdate({
				[xn]: rounded[0]
			});
		}
		if (yn) {
			onUpdate({
				[yn]: rounded[1]
			});
		}
	});
	const className = toClassName(
		css["handle"], 
		css[name],
		dragging && css["dragging"],
	);
	return (
		<div className={className} onPointerDown={handlePointerDown}></div>
	);
}