import { Vec2, vec2 } from "@common/vec2.ts";
import { SelectableItem, SelectionItem, selectionToSelectable, useEditorSelection } from "@components/editor/selection.ts";
import { toClassName } from "@components/utils.tsx";
import { Bounds, BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { Dispatch, FC, ReactNode, SetStateAction } from "react";
import css from "./ActiveSelection.module.css";
import { ResizeHandle } from "./ResizeHandle.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { maybeConst } from "@common/maybeConst.ts";
import { getAffine, getSelectableBounds, getTranslate } from "./getObjectProperties.ts";
import { textRadius } from "@editor/object/text.ts";

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
	const active = selection.length === 1;
	const multi = selection.length > 1;

	const activeSelItems = selection.map(item => (
		<ActiveSelectionItem key={item.id} {...{ item, viewportInfo, active }} />
	));
	if (multi) {
		const selectables = selection.map(i => selectionToSelectable(i, map));
		const bounds = Bounds.merge(selectables.map(getSelectableBounds));
		const setBounds: Dispatch<SetStateAction<Bounds>> = (update) => {
			const newBounds = maybeConst(update, bounds);
			// Find S and T such that bounds.affine(S, T) = newBounds,
			// Then apply to all objects.
			// b0 := bounds; b1 := newBounds
			// S = b1.size / b0.size
			// T = b1 - b0 * S
			const scale = newBounds.size.div(bounds.size);
			const translate = newBounds.topLeft.sub(bounds.topLeft.mul(scale));
			selectables.forEach(item => {
				switch (item.type) {
					case "object": {
						dispatchMap({
							type: "replace_object",
							target: item.object.id,
							replacement: obj => getAffine(item.object)(item.object, scale, translate)
						});
						break;
					}
					case "room": {
						dispatchMap({
							type: "replace_room",
							target: item.room.id,
							replacement: room => ({ ...room, bounds: item.room.bounds.affine(scale, translate) })
						});
						break;
					}
				}
			});
		}
		const setTranslate = (sel: SelectableItem[], diff: Vec2): void => {
			sel.forEach(item => {
				switch (item.type) {
					case "object": {
						dispatchMap({
							type: "replace_object",
							target: item.object.id,
							replacement: obj => getTranslate(item.object)(item.object, diff)
						});
						break;
					}
					case "room": {
						dispatchMap({
							type: "replace_room",
							target: item.room.id,
							replacement: room => ({ ...room, bounds: item.room.bounds.translate(diff) })
						});
						break;
					}
				}
			});
		};
		return (
			<>
				{activeSelItems}
				<BoundsSelection
					object={selectables}
					bounds={bounds}
					setBounds={setBounds}
					setTranslate={setTranslate}
					active
					{...{ viewportInfo }} />
			</>
		);
	}
	return (
		<>
			{activeSelItems}
		</>
	);
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
		return <BoundsSelection {...{ viewportInfo, active, object: room, bounds, setBounds }} />;
	}

	const object = getObject(map, item.id);
	if (!object) return null;

	switch (object.type) {
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
		case "block":
		case "gravityZone":
		case "teleporter":
			{
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
				const translate = getTranslate(object);
				const setTranslate = (obj: typeof object, diff: Vec2) => {
					dispatchMap({
						type: "replace_object",
						target: object.id,
						replacement: () => translate(obj, diff),
					});
				}
				return <BoundsSelection {...{ viewportInfo, object, active, bounds, setBounds, setTranslate }} />;
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
			return <CircleSelection radius={textRadius} {...{ viewportInfo, active, pos, setPos }} />;
		}
	}
}

type BoundsSelectionProps<O> = {
	viewportInfo: ViewportInfo;
	object: O;
	active?: boolean;
	bounds: Bounds;
	setBounds: Dispatch<SetStateAction<Bounds>>;
	/** `translate` sets object position from ORIGINAL position, before dragging */
	setTranslate?: (originalObj: O, diff: Vec2) => void;
};
const BoundsSelection = <O,>({
	viewportInfo, active = true, object,
	bounds, setBounds,
	setTranslate: translate = (_, diff) => setBounds(bounds.translate(diff)),
}: BoundsSelectionProps<O>): ReactNode => {
	const [x, y] = bounds.topLeft;
	const [w, h] = bounds.size;
	const onUpdate = (update: BoundsUpdateLRTBWH) => {
		setBounds(b => b.set(update, "prefer-old"));
	}
	const { listeners, dragging } = useDrag({
		buttons: MouseButtons.Left,
		enabled: active,
		normalizeDir: false,
		stopPropagation: true,
		onDrag: (curr, _, orig) => {
			if (!active) return;
			const diff = curr.sub(orig).div(viewportInfo.camera.scale);
			const rounded = vec2(
				Math.round(diff[0] / rounding) * rounding,
				Math.round(diff[1] / rounding) * rounding,
			);
			// object is the ORIGINAL object
			// because closures
			translate(object, rounded);
		},
	});
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
		}} {...listeners}>
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
	const { listeners, dragging } = useDrag({
		buttons: MouseButtons.Left,
		normalizeDir: false,
		enabled: active,
		stopPropagation: true,
		onDrag: (curr, _, orig) => {
			if (!active) return;
			const diff = curr.sub(orig).div(viewportInfo.camera.scale);
			const rounded = vec2(
				Math.round(diff[0] / rounding) * rounding,
				Math.round(diff[1] / rounding) * rounding,
			);
			// pos is original pos due to closure
			setPos(pos.add(rounded));
		},
	});
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
		}} {...listeners}></div>
	);
}