import { Vec2, vec2 } from "@common/vec2.ts";
import { SelectionItem, useEditorSelection } from "@components/editor/selection.ts";
import { toClassName } from "@components/utils.tsx";
import { Bounds, BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { Dispatch, FC, SetStateAction } from "react";
import css from "./ActiveSelection.module.css";
import { ResizeHandle } from "./ResizeHandle.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { maybeConst } from "@common/maybeConst.ts";

const rounding = 1;

type ActiveSelectionProps = {
	viewportInfo: ViewportInfo;
};
export const ActiveSelection: FC<ActiveSelectionProps> = ({
	viewportInfo,
}) => {
	const selection = useEditorSelection();
	// const map = useSkapMap();
	// const dispatchMap = useDispatchSkapMap();
	const active = selection.length === 1;

	return selection.map(item => (
		<ActiveSelectionItem key={item.id} {...{ item, viewportInfo, active }} />
	));
}

type ActiveSelectionItemProps = {
	item: SelectionItem;
	viewportInfo: ViewportInfo;
	active: boolean;
};
const ActiveSelectionItem: FC<ActiveSelectionItemProps> = ({
	item, viewportInfo,
	active,
}) => {
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();

	if (item.type === "room") {
		const room = map.rooms.get(item.id);
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
		return <BoundsSelection {...{ viewportInfo, active, bounds, setBounds }} />;
	}

	const object = getObject(map, item.id);
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
						bounds: maybeConst(update, obj.bounds),
					} : obj
				});
			}
			return <BoundsSelection {...{ viewportInfo, active, bounds, setBounds }} />;
		}
		case "text": {
			const { pos } = object;
			const setPos: Dispatch<SetStateAction<Vec2>> = pos => dispatchMap({
				type: "replace_object",
				target: object.id,
				replacement: obj => "pos" in obj ? {
					...obj,
					pos: maybeConst(pos, obj.pos)
				} : obj
			});
			return <CircleSelection radius={5} {...{ viewportInfo, active, pos, setPos }} />;
		}
	}
}

type BoundsSelectionProps = {
	viewportInfo: ViewportInfo;
	active?: boolean;
	bounds: Bounds;
	setBounds: Dispatch<SetStateAction<Bounds>>;
};
const BoundsSelection: FC<BoundsSelectionProps> = ({
	viewportInfo, bounds, setBounds,
	active = true,
}) => {
	const [x, y] = bounds.topLeft;
	const [w, h] = bounds.size;
	const onUpdate = (update: BoundsUpdateLRTBWH) => {
		setBounds(b => b.set(update, "prefer-old"));
	}
	const { onPointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		if (!active) return;
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		// bounds is the ORIGINAL bounds
		// because closures
		setBounds(bounds.translate(rounded));
	}, false, active);
	const props = {
		viewportInfo,
		onUpdate
	};
	const className = toClassName(
		css["selection"],
		css["rect"],
		dragging && css["dragging"],
		!active && css["inactive"],
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

type CircleSelectionProps = {
	viewportInfo: ViewportInfo;
	active?: boolean;
	pos: Vec2;
	setPos: Dispatch<SetStateAction<Vec2>>;
	radius: number;
}
const CircleSelection: FC<CircleSelectionProps> = ({
	viewportInfo,
	pos, setPos,
	radius,
	active = true,
}) => {
	const { onPointerDown, dragging } = useDrag(MouseButtons.Left, null, (curr, _, orig) => {
		if (!active) return;
		const diff = curr.sub(orig).div(viewportInfo.camera.scale);
		const rounded = vec2(
			Math.round(diff[0] / rounding) * rounding,
			Math.round(diff[1] / rounding) * rounding,
		);
		// pos is original pos due to closure
		setPos(pos.add(rounded));
	}, false, active);
	const [x, y] = pos;
	const className = toClassName(
		css["selection"],
		css["circle"],
		dragging && css["dragging"],
		!active && css["inactive"],
	);
	return (
		<div className={className} style={{
			"--x": `${x}px`,
			"--y": `${y}px`,
			"--r": `${radius}px`,
		}} onPointerDown={onPointerDown}></div>
	);
}