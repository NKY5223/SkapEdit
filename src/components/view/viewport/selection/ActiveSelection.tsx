import { maybeConst } from "@common/maybeConst.ts";
import { Vec2, vec2 } from "@common/vec2.ts";
import { SelectableItem, selectionInRoom, SelectionItem, selectionKey, selectionToSelectable, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { useToast } from "@components/toast/context.ts";
import { toClassName } from "@components/utils.tsx";
import { Bounds, BoundsUpdateLRTBWH } from "@editor/bounds.ts";
import { textRadius } from "@editor/object/text.tsx";
import { getObject, useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { Dispatch, FC, MouseEventHandler, ReactNode, SetStateAction } from "react";
import { ViewportAction, ViewportInfo } from "../Viewport.tsx";
import css from "./ActiveSelection.module.css";
import { getAffine, getSelectableBounds, getTranslate } from "./getObjectProperties.ts";
import { ResizeHandle } from "./ResizeHandle.tsx";
import { round } from "@common/number.ts";
import { centeredBounds } from "@editor/object/moving.tsx";
import { SkapTurret } from "@editor/object/turret.tsx";
import { id } from "zod/locales";
import { useSetting } from "@components/settings/settings.ts";

type ActiveSelectionProps = {
	viewportInfo: ViewportInfo;
	dispatchView: Dispatch<ViewportAction>;
};
export const ActiveSelection: FC<ActiveSelectionProps> = ({
	viewportInfo,
	dispatchView,
}) => {
	const selection = useEditorSelection();
	const map = useSkapMap();
	const room = viewportInfo.room;
	const dispatchMap = useDispatchSkapMap();
	const roomSelection = selection.filter(s => selectionInRoom(s, room));
	const selectables = roomSelection.map(i => selectionToSelectable(i, map));
	const active = selectables.length === 1;
	const multi = selectables.length > 1;

	const activeSelItems = roomSelection.map(item => (
		<ActiveSelectionItem key={selectionKey(item)} {...{ item, viewportInfo, active, dispatchView }} />
	));
	if (multi) {
		const bounds = Bounds.merge(selectables.map(getSelectableBounds));
		// TODO: CAN CAUSE NANS AND INFINITIES
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
					case "node_movingObject": {
						const { object, nodeIndex, node } = item;
						dispatchMap({
							type: "replace_object",
							target: object.id,
							replacement: obj => "points" in obj ? {
								...obj,
								points: obj.points.with(nodeIndex, {
									...node,
									pos: node.pos.mul(scale).add(translate),
								}),
							} : obj,
						});
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
							replacement: () => getTranslate(item.object)(item.object, diff)
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
					case "node_movingObject": {
						const { object, nodeIndex, node } = item;
						dispatchMap({
							type: "replace_object",
							target: object.id,
							replacement: obj => "points" in obj ? {
								...obj,
								points: obj.points.with(nodeIndex, {
									...node,
									pos: node.pos.add(diff),
								}),
							} : obj,
						});
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
	dispatchView: Dispatch<ViewportAction>;
};
const ActiveSelectionItem: FC<ActiveSelectionItemProps> = ({
	item, viewportInfo,
	active,
	dispatchView,
}) => {
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const dispatchSelection = useDispatchSelection();
	const toast = useToast();

	switch (item.type) {
		case "room": {
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
		case "object": {
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
				case "spawner":
				case "door":
				case "button":
				case "switch":
				case "rotatingLava":
					{
						const { type, bounds } = object;
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
						const onDoubleClick: MouseEventHandler = object.type !== "teleporter" ? () => { } : () => {
							const { target } = object;
							if (target === null) return;
							const room = target.type === "room"
								? map.rooms.get(target.roomId)
								: map.rooms.values().find(room => room.objects.has(target.teleporterId));
							if (!room) {
								toast.warn("Could not find teleporter destination");
								return;
							}
							const teleporter = target.type === "room" ? undefined : room.objects.get(target.teleporterId);
							const pos = (teleporter && teleporter.type === "teleporter"
								? teleporter.bounds.center()
								: undefined) ?? room.bounds.center();
							dispatchView({
								type: "set_current_room_id",
								currentRoomId: room.id,
							});
							dispatchView({
								type: "set_camera_pos",
								pos,
							});
						};
						if (type === "rotatingLava") {
							const pos = object.rotation.center;
							const setPos: Dispatch<SetStateAction<Vec2>> = pos => dispatchMap({
								type: "replace_object",
								target: object.id,
								replacement: obj => obj.type === "rotatingLava" ? {
									...obj,
									rotation: {
										...obj.rotation,
										center: maybeConst(pos, obj.rotation.center),
									},
								} : obj
							});
							return (<>
								<BoundsSelection {...{ viewportInfo, object, active, bounds, setBounds, setTranslate, onDoubleClick }} />
								<PointSelection {...{ viewportInfo, active, pos, setPos }} radius={1} />
							</>);
						}
						return <BoundsSelection {...{ viewportInfo, object, active, bounds, setBounds, setTranslate, onDoubleClick }} />;
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
					return <PointSelection radius={textRadius} {...{ viewportInfo, active, pos, setPos }} />;
				}

				case "circularObstacle":
				case "circularLava":
				case "circularSlime":
				case "circularIce":
					{
						const { type, pos, radius } = object;
						const setPos: Dispatch<SetStateAction<Vec2>> = pos => dispatchMap({
							type: "replace_object",
							target: object.id,
							replacement: obj => "pos" in obj ? {
								...obj,
								pos: maybeConst(pos, obj.pos)
							} : obj
						});
						const setRadius: Dispatch<SetStateAction<number>> = radius => dispatchMap({
							type: "replace_object",
							target: object.id,
							replacement: obj => obj.type === type ? {
								...obj,
								radius: maybeConst(radius, obj.radius)
							} : obj
						});
						return <CircleSelection {...{ viewportInfo, active, pos, setPos, radius, setRadius }} />;
					}

				case "movingObstacle":
				case "movingLava":
				case "movingSlime":
				case "movingIce":
					{
						const { type, size, points } = object;
						const setBounds: Dispatch<SetStateAction<Bounds>> = update => {
							dispatchMap({
								type: "replace_object",
								target: object.id,
								replacement: obj => {
									if (obj.type !== type) return obj;
									const newBounds = maybeConst(update, centeredBounds(obj.points[0].pos, obj.size));
									return {
										...obj,
										size: newBounds.size,
										points: obj.points.with(0, {
											...obj.points[0],
											pos: newBounds.center(),
										}),
									} satisfies typeof obj;
								}
							});
						}
						const bounds = centeredBounds(points[0].pos, size);

						const setTranslate = (obj: typeof object, diff: Vec2) => {
							dispatchMap({
								type: "replace_object",
								target: object.id,
								replacement: () => ({
									...obj,
									points: obj.points.with(0, {
										...obj.points[0],
										pos: obj.points[0].pos.add(diff),
									}),
								}),
							});
						}
						return <BoundsSelection {...{ viewportInfo, object, active, bounds, setBounds, setTranslate }} />;
					}

				case "turret": {
					const { type, id, pos } = object;
					const update = (f: (obj: SkapTurret) => SkapTurret) => dispatchMap({
						type: "replace_object",
						target: id,
						replacement: obj => obj.type !== type ? obj : f(obj),
					});
					const setPos: Dispatch<SetStateAction<Vec2>> = pos => update(obj => ({
						...obj,
						pos: maybeConst(pos, obj.pos),
					}));

					return <PointSelection radius={3} {...{ viewportInfo, active, pos, setPos }} />
				}
			}
			return "uh oh";
		}
		case "node_movingObject": {
			const { objectId, nodeIndex } = item;

			const object = getObject(map, objectId);
			if (!object) return null;
			if (!("points" in object)) return null;

			const { type, points } = object;

			const node = points.at(nodeIndex);
			if (!node) {
				dispatchSelection({
					type: "remove_item",
					item,
				});
				return null;
			}

			const { pos } = node;

			const setPos: Dispatch<SetStateAction<Vec2>> = pos => dispatchMap({
				type: "replace_object",
				target: object.id,
				replacement: obj => obj.type === type ? {
					...obj,
					points: obj.points.with(nodeIndex, {
						...obj.points[nodeIndex],
						pos: maybeConst(pos, obj.points[nodeIndex].pos),
					})
				} : obj
			});
			return (<>
				<PointSelection {...{ viewportInfo, active, pos, setPos }} radius={1} />
			</>);
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

	onDoubleClick?: MouseEventHandler;
};
const BoundsSelection = <O,>({
	viewportInfo, active = true, object,
	bounds, setBounds,
	setTranslate: translate = (_, diff) => setBounds(bounds.translate(diff)),
	onDoubleClick,
}: BoundsSelectionProps<O>): ReactNode => {
	const rounding = useSetting("grid");
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
				round(rounding, diff[0]),
				round(rounding, diff[1]),
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
		}} {...listeners} onDoubleClick={onDoubleClick}>
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
	setRadius: Dispatch<SetStateAction<number>>;
	radius: number;
}
const CircleSelection: FC<CircleSelectionProps> = ({
	viewportInfo,
	pos, setPos,
	radius, setRadius,
	active = true,
}) => {
	const rounding = useSetting("grid");
	const { listeners, dragging } = useDrag({
		buttons: MouseButtons.Left,
		normalizeDir: false,
		enabled: active,
		stopPropagation: true,
		onDrag: (curr, _, orig) => {
			if (!active) return;
			const diff = curr.sub(orig).div(viewportInfo.camera.scale);
			const rounded = vec2(
				round(rounding, diff[0]),
				round(rounding, diff[1]),
			);
			// pos is original pos due to closure
			setPos(pos.add(rounded));
		},
	});
	const [x, y] = pos;
	const onUpdate = (update: BoundsUpdateLRTBWH) => {
		if ("left" in update && "top" in update) {
			const dx = x - update.left;
			const dy = y - update.top;
			setRadius(round(rounding, Math.hypot(dx, dy)));
		}
	}
	const props = {
		viewportInfo,
		onUpdate
	};
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
		}} {...listeners}>
			<ResizeHandle x={-1} y={-1} circle {...props} />

			{/* <ResizeHandle x={+0} y={-1} {...props} />
			<ResizeHandle x={-1} y={+0} {...props} />
			<ResizeHandle x={+1} y={+0} {...props} />
			<ResizeHandle x={+0} y={+1} {...props} /> */}
		</div>
	);
}

type PointSelectionProps = {
	viewportInfo: ViewportInfo;
	active?: boolean;
	pos: Vec2;
	setPos: Dispatch<SetStateAction<Vec2>>;
	radius: number;
}
const PointSelection: FC<PointSelectionProps> = ({
	viewportInfo,
	pos, setPos,
	radius,
	active = true,
}) => {
	const rounding = useSetting("grid");
	const { listeners, dragging } = useDrag({
		buttons: MouseButtons.Left,
		normalizeDir: false,
		enabled: active,
		stopPropagation: true,
		onDrag: (curr, _, orig) => {
			if (!active) return;
			const diff = curr.sub(orig).div(viewportInfo.camera.scale);
			const rounded = vec2(
				round(rounding, diff[0]),
				round(rounding, diff[1]),
			);
			// pos is original pos due to closure
			setPos(pos.add(rounded));
		},
	});
	const [x, y] = pos;
	const className = toClassName(
		css["selection"],
		css["point"],
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