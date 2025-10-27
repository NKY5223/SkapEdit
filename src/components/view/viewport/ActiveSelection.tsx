import { Vec2, vec2 } from "@common/vec2.ts";
import { useEditorSelection } from "@components/editor/selection.ts";
import { toClassName } from "@components/utils.tsx";
import { Bounds, BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { getObject, SkapObject, useDispatchSkapMap, useSkapMap } from "@editor/map.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { Dispatch, FC, SetStateAction } from "react";
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
	const dispatchMap = useDispatchSkapMap();

	if (!selection) return null;

	if (selection.type === "room") {
		const room = map.rooms.get(selection.id);
		if (!room) return null;

		const { bounds } = room;
		const setBounds: Dispatch<SetStateAction<Bounds>> = update => {
			dispatchMap({
				type: "replace_room",
				target: room.id,
				replacement: room => ({
					...room,
					bounds: update instanceof Bounds
						? update
						: update(room.bounds),
				})
			});
		}
		return <BoundsActiveSelection {...{ viewportInfo, bounds, setBounds }} />;
	}

	const object = getObject(map, selection.id);
	if (!object) return null;

	switch (object.type) {
		case "obstacle":
		case "lava": {
			const { bounds } = object;
			const setBounds: Dispatch<SetStateAction<Bounds>> = update => {
				dispatchMap({
					type: "replace_object",
					target: object.id,
					replacement: obj => "bounds" in obj ? {
						...obj,
						bounds: update instanceof Bounds
							? update
							: update(obj.bounds),
					} : obj
				});
			}
			return <BoundsActiveSelection {...{ viewportInfo, bounds, setBounds }} />;
		}
		case "text": {
			return <CircleActiveSelection {...{ viewportInfo, object }} />;
		}
	}
}

type BoundsActiveSelectionProps = {
	viewportInfo: ViewportInfo;
	bounds: Bounds;
	setBounds: Dispatch<SetStateAction<Bounds>>;
};
const BoundsActiveSelection: FC<BoundsActiveSelectionProps> = ({
	viewportInfo, bounds, setBounds
}) => {
	const [x, y] = bounds.topLeft;
	const [w, h] = bounds.size;
	const onUpdate = (update: BoundsUpdateLRTBWH) => {
		setBounds(b => b.set(update, "prefer-old"));
	}
	const { onPointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		// bounds is the ORIGINAL bounds
		// because closures
		setBounds(bounds.translate(rounded));
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
		}} onPointerDown={onPointerDown}>
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
	const { onPointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		dispatchMap({
			type: "replace_object",
			target: object.id,
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
		}} onPointerDown={onPointerDown}></div>
	);
}