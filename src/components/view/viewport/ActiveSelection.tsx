import { Vec2, vec2 } from "@common/vec2.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { toClassName } from "@components/utils.tsx";
import { Bounds, BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { getObject, SkapObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { FC } from "react";
import css from "./ActiveSelection.module.css";
import { ResizeHandle } from "./ResizeHandle.tsx";
import { ViewportInfo } from "./Viewport.tsx";

const rounding = 1;

type ActiveSelectionProps = {
	viewportInfo: ViewportInfo;
};
export const ActiveSelection: FC<ActiveSelectionProps> = ({
	viewportInfo,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();

	if (!selection) return null;
	const object = getObject(map, selection);
	if (!object) return null;

	switch (object.type) {
		case "obstacle":
		case "lava": {
			return <BoundsActiveSelection {...{ viewportInfo, object }} />
		}
		case "text": {
			return <CircleActiveSelection {...{ viewportInfo, object }} />
		}
	}
}

type BoundsActiveSelectionProps = {
	viewportInfo: ViewportInfo;
	object: SkapObject & { bounds: Bounds };
};
const BoundsActiveSelection: FC<BoundsActiveSelectionProps> = ({
	viewportInfo, object
}) => {
	const dispatchMap = useDispatchSkapMap();

	const [x, y] = object.bounds.topLeft;
	const [w, h] = object.bounds.size;
	const onUpdate = (update: BoundsUpdateLRTBWH) => {
		dispatchMap({
			type: "replace_object",
			targetObject: object.id,
			replacement: obj => "bounds" in obj ? {
				...obj,
				bounds: obj.bounds.set(update, "prefer-old")
			} : obj
		});
	}
	const { handlePointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		dispatchMap({
			type: "replace_object",
			targetObject: object.id,
			replacement: obj => ({
				...obj,
				// object.bounds is the ORIGINAL bounds
				// because closures
				bounds: object.bounds.translate(rounded)
			})
		});
	});
	const props = {
		viewportInfo,
		onUpdate
	};
	const className = toClassName(
		css["selection"],
		css["rect"],
		dragging && css["dragging"]
	);
	return (
		<div className={className} style={{
			"--x": `${x}px`,
			"--y": `${y}px`,
			"--w": `${w}px`,
			"--h": `${h}px`,
		}} onPointerDown={handlePointerDown}>
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

type CircleActiveSelectionProps = {
	viewportInfo: ViewportInfo;
	object: SkapObject & { pos: Vec2 };
}
const CircleActiveSelection: FC<CircleActiveSelectionProps> = ({
	viewportInfo, object
}) => {

	const dispatchMap = useDispatchSkapMap();
	const { handlePointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		dispatchMap({
			type: "replace_object",
			targetObject: object.id,
			replacement: obj => ({
				...obj,
				// object.pos is the ORIGINAL pos
				// because closures
				pos: object.pos.add(rounded)
			})
		});
	});

	const [x, y] = object.pos;
	const className = toClassName(
		css["selection"], 
		css["circle"],
		dragging && css["dragging"],
	);
	return (
		<div className={className} style={{
			"--x": `${x}px`,
			"--y": `${y}px`,
			"--r": `5px`,
		}} onPointerDown={handlePointerDown}></div>
	);
}