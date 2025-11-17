import { sortBy } from "@common/array.ts";
import { Vec2, vec2 } from "@common/vec2.ts";
import { Sections, makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { makeNodeSelectableItem, makeObjectSelectableItem, makeObjectSelectionItem, makeRoomSelectableItem, selectableToSelection, selectionInRoom, selectionToSelectable, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { mergeListeners, toClassName } from "@components/utils.tsx";
import { Bounds } from "@editor/bounds.ts";
import { SkapObject, SkapRoom, makeBlock, makeCardinalGravityZone, makeCircularIce, makeCircularLava, makeCircularObstacle, makeCircularSlime, makeGravityZone, makeIce, makeLava, makeMovePoint, makeMovingIce, makeMovingLava, makeMovingObstacle, makeMovingSlime, makeObstacle, makeRotatingLava, makeSlime, makeText } from "@editor/map.ts";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { useElementSize } from "@hooks/useElementSize.ts";
import { Dispatch, FC, ReactNode, useMemo, useRef } from "react";
import { viewportToMap } from "./mapping.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { BlockWebGLRenderer } from "./renderer/block.ts";
import { GravityZoneWebGLRenderer } from "./renderer/gravityZone.ts";
import { CircularIceWebGLRenderer, IceWebGLRenderer, MovingIceWebGLRenderer } from "./renderer/ice.ts";
import { CircularLavaWebGLRenderer, LavaWebGLRenderer, MovingLavaWebGLRenderer, RotatingLavaWebGLRenderer } from "./renderer/lava.ts";
import { CircularObstacleWebGLRenderer, MovingObstacleWebGLRenderer, ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { CircularSlimeWebGLRenderer, MovingSlimeWebGLRenderer, SlimeWebGLRenderer } from "./renderer/slime.ts";
import { TeleporterWebGLRenderer } from "./renderer/teleporter.ts";
import { TextLayer } from "./renderer/text.tsx";
import { ActiveSelection } from "./selection/ActiveSelection.tsx";
import { getClickbox, getSelectableBounds, getTranslate, getZIndex } from "./selection/getObjectProperties.ts";
import css from "./Viewport.module.css";
import { ViewportAction, ViewportInfo, ViewportState, wheelMult } from "./Viewport.tsx";
import { ViewportCanvas } from "./ViewportCanvas.tsx";
import { ViewportRoomSwitcher } from "./ViewportRoomSwitcher.tsx";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { SpawnerBackgroundWebGLRenderer, SpawnerEntitiesWebGLRenderer } from "./renderer/spawner.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { Color } from "@common/color.ts";
import { hotkeysHandler, keybindStr } from "@common/keybind.ts";
import { ID } from "@common/uuid.ts";
import { AllMovingNodeWebGLRenderer, AllMovingTrackWebGLRenderer } from "./renderer/movingTrack.ts";
import { TurretWebGLRenderer } from "./renderer/turret.ts";
import { DoorWebGLRenderer } from "./renderer/door.ts";
import { ButtonWebGLRenderer } from "./renderer/button.ts";
import { DoorLinkWebGLRenderer } from "./renderer/doorLink.ts";
import { SwitchWebGLRenderer } from "./renderer/switch.ts";

/** Maximum distance for something to count as a click */
const clickMaxDistance = 2;

type RealViewportProps = {
	state: ViewportState;
	dispatchView: Dispatch<ViewportAction>;
	room: SkapRoom;
	viewSwitcher: ReactNode;
}
export const RealViewport: FC<RealViewportProps> = ({
	state, dispatchView,
	room,
	viewSwitcher,
}) => {
	const timeOrigin = useMemo(() => performance.now(), []);
	// useMemo because the webgl canvas should persist
	const layers = useMemo(() => [
		WebGLLayer(
			new BackgroundObstacleWebGLRenderer(),
			new BackgroundWebGLRenderer(),
			// Place spawner behind everything (it was tinting stuff weird)
			new SpawnerBackgroundWebGLRenderer(),
			new ObstacleWebGLRenderer(),
			new CircularObstacleWebGLRenderer(),
			new MovingObstacleWebGLRenderer(),
			new TeleporterWebGLRenderer(),
			new LavaWebGLRenderer(),
			new RotatingLavaWebGLRenderer(),
			new CircularLavaWebGLRenderer(),
			new MovingLavaWebGLRenderer(),
			new IceWebGLRenderer(),
			new CircularIceWebGLRenderer(),
			new MovingIceWebGLRenderer(),
			new SlimeWebGLRenderer(),
			new CircularSlimeWebGLRenderer(),
			new MovingSlimeWebGLRenderer(),
			new AllMovingTrackWebGLRenderer(),
			new AllMovingNodeWebGLRenderer(),
			new ButtonWebGLRenderer(),
			new SwitchWebGLRenderer(),
			new DoorWebGLRenderer(),
			new DoorLinkWebGLRenderer(),
			new BlockWebGLRenderer(0),
			// Particles
			new SpawnerEntitiesWebGLRenderer(),
			new TurretWebGLRenderer(),
			// Players
			new BlockWebGLRenderer(1),
			// Reward
			// HatReward
			// CoinReward (???)
			// Box (wall power)
			new GravityZoneWebGLRenderer(),
			// Fuel Zone (?)
		),
		TextLayer,
		WebGLLayer(
			new BlockWebGLRenderer(1), // (again???)
			// debug
		)
	], []);

	const toolbarRef = useRef<HTMLDivElement>(null);
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();
	const selection = useEditorSelection();
	const dispatchSelection = useDispatchSelection();

	const { scaleIndex, camera } = state;

	const viewportElRef = useRef<HTMLDivElement | null>(null);
	const viewportSize = useElementSize(viewportElRef);
	const rect = viewportElRef.current?.getBoundingClientRect();
	const viewportPos = vec2(rect?.left ?? 0, rect?.top ?? 0);
	const viewportBounds = camera.getBounds(viewportSize);

	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		viewportPos,
		room,
		viewportBounds,
		timeOrigin,
	};

	const elementInToolbar = (el: Element) => {
		const toolbar = toolbarRef.current;
		if (!toolbar) return;
		return toolbar.contains(el);
	}


	const objectSelectables = room.objects.values().toArray().map(makeObjectSelectableItem);
	const roomSelectableItem = makeRoomSelectableItem(room);
	const nodeSelectables = room.objects.values()
		.filter(obj => "points" in obj)
		.flatMap(obj => obj.points.map((point, i) => makeNodeSelectableItem(obj, i)))
		.toArray();
	const allSelectables = [
		...objectSelectables,
		roomSelectableItem,
		...nodeSelectables,
	];

	const addAndSelect = (object: SkapObject) => {
		dispatchMap({
			type: "add_object",
			roomId: room.id,
			object,
		});
		dispatchSelection({
			type: "set_selection",
			selection: [makeObjectSelectionItem(object)]
		});
	}

	const contextMenu = useContextMenu([
		makeSection(Sections.viewport, [
			makeSingle("viewport.reset_camera", "reset_shutter_speed", () => {
				dispatchView({
					type: "set_camera_pos",
					pos: vec2(0),
				});
				dispatchView({
					type: "set_camera_scale",
					scaleIndex: 0,
				});
			}),
		]),

		makeSubmenu("viewport.add_object", "add", [
			makeSubmenu("viewport.add_object.basic", "square", [
				makeSingle("viewport.add_object.obstacle", "obstacle", () => {
					addAndSelect(makeObstacle(0, 0, 10, 10));
				}),
				makeSingle("viewport.add_object.lava", "square", () => {
					addAndSelect(makeLava(0, 0, 10, 10));
				}),
				makeSingle("viewport.add_object.slime", "square", () => {
					addAndSelect(makeSlime(0, 0, 10, 10));
				}),
				makeSingle("viewport.add_object.ice", "square", () => {
					addAndSelect(makeIce(0, 0, 10, 10));
				}),
			]),
			makeSingle("viewport.add_object.block", "square", () => {
				addAndSelect(makeBlock(0, 0, 10, 10, Color.hex(0xff00ff, 1), 0, false));
			}),
			makeSingle("viewport.add_object.text", "text_fields", () => {
				addAndSelect(makeText(0, 0, "|"));
			}),
			makeSingle("viewport.add_object.gravityZone", null, () => {
				addAndSelect(makeCardinalGravityZone(0, 0, 10, 10, CardinalDirection.Down));
			}),
			makeSingle("viewport.add_object.rotatingLava", null, () => {
				addAndSelect(makeRotatingLava(0, 0, 10, 10, vec2(5, 5), 0, 90));
			}),
			makeSubmenu("viewport.add_object.circular", "circle", [
				makeSingle("viewport.add_object.circularObstacle", null, () => {
					addAndSelect(makeCircularObstacle(0, 0, 10));
				}),
				makeSingle("viewport.add_object.circularLava", null, () => {
					addAndSelect(makeCircularLava(0, 0, 10));
				}),
				makeSingle("viewport.add_object.circularSlime", null, () => {
					addAndSelect(makeCircularSlime(0, 0, 10));
				}),
				makeSingle("viewport.add_object.circularIce", null, () => {
					addAndSelect(makeCircularIce(0, 0, 10));
				}),
			]),
			makeSubmenu("viewport.add_object.moving", "move_item", [
				makeSingle("viewport.add_object.movingObstacle", null, () => {
					addAndSelect(makeMovingObstacle(10, 10, 5, [makeMovePoint(0, 0, 0)]));
				}),
				makeSingle("viewport.add_object.movingLava", null, () => {
					addAndSelect(makeMovingLava(10, 10, 5, [makeMovePoint(0, 0, 0)]));
				}),
				makeSingle("viewport.add_object.movingSlime", null, () => {
					addAndSelect(makeMovingSlime(10, 10, 5, [makeMovePoint(0, 0, 0)]));
				}),
				makeSingle("viewport.add_object.movingIce", null, () => {
					addAndSelect(makeMovingIce(10, 10, 5, [makeMovePoint(0, 0, 0)]));
				}),
			]),
		]),
	]);

	// #region Single-item selection
	const onClick: React.MouseEventHandler = e => {
		// Must be a click originating in this element
		if (e.target !== e.currentTarget) return;

		// Mouse position diff (pixels)
		const diff = selectBounds.size.mul(viewportSize);
		// Must be within 2px (i.e. not dragging to select)
		if (diff.mag() > clickMaxDistance) return;

		const { left, top } = e.currentTarget.getBoundingClientRect();
		const clickPos = viewportToMap(viewportInfo, vec2(e.clientX - left, e.clientY - top));

		const clickedItems = sortBy(
			allSelectables.filter(obj => getClickbox(obj, clickPos)),
			getZIndex,
			// Descending order of z-index
			(a, b) => b - a
		);

		const item = clickedItems[0];
		if (e.shiftKey) {
			if (!item) return;
			dispatchSelection({
				type: "add_item",
				item: selectableToSelection(item)
			});
		} else {
			if (!item) {
				dispatchSelection({
					type: "clear_selection",
				});
				return;
			}
			dispatchSelection({
				type: "set_selection",
				selection: [selectableToSelection(item)]
			});
		}
	};
	// #endregion

	// #region Multi-item selection
	const {
		dragging: selectDragging, listeners: selectDragListeners, beforeDrag: selectDragInitial, currentPos: selectDragCurrent,
	} = useDrag({
		buttons: MouseButtons.Left,
		normalizeToUnit: viewportElRef,
		onEndDrag: e => {
			// Mouse position diff (pixels)
			const diff = selectBounds.size.mul(viewportSize);
			// Must be > 2px (i.e. dragging to select)
			if (diff.mag() <= clickMaxDistance) return;
			const newselect = allSelectables.filter(s => selectBounds.containsBounds(getSelectableBounds(s)));
			dispatchSelection({
				type: "set_selection",
				selection: newselect.map(selectableToSelection)
			});
		}
	});
	const selectBounds = Bounds.fromCorners(
		viewportBounds.lerp(selectDragInitial),
		viewportBounds.lerp(selectDragCurrent)
	);
	// #endregion

	// #region Camera
	const { dragging, listeners: moveDragListeners } = useDrag({
		buttons: MouseButtons.Middle,
		onDrag: (curr, _, orig) => {
			const diff = curr.sub(orig).div(camera.scale);
			dispatchView({
				type: "set_camera_pos",
				pos: camera.pos.sub(diff),
			});
		}
	});
	const onWheel: React.WheelEventHandler<HTMLElement> = e => {
		if (e.target instanceof Element && elementInToolbar(e.target)) return;
		const d = e.deltaY * wheelMult(e.deltaMode);
		const newIndex = scaleIndex + d;

		dispatchView({
			type: "set_camera_scale",
			scaleIndex: newIndex,
		});
	}
	// #endregion

	const roomSelection = selection.filter(s => selectionInRoom(s, room));
	const roomSelectables = roomSelection.map(i => selectionToSelectable(i, map));
	const translateSelected = (diff: Vec2) => {
		for (const item of roomSelectables) {
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
		}
	}
	const translateCamera = (diff: Vec2) => {
		dispatchView({
			type: "set_camera_pos",
			pos: camera.pos.add(diff),
		});
	}
	// #region Hotkeys
	const onKeyDown = hotkeysHandler([
		[keybindStr("ctrl+KeyA"), () => {
			const newSelection = [
				...objectSelectables,
				...nodeSelectables,
			].map(selectableToSelection);
			dispatchSelection({
				type: "set_selection",
				selection: newSelection,
			});
		}, { preventDefault: true }],

		[keybindStr("Escape"), () => dispatchSelection({ type: "clear_selection" })],

		[[keybindStr("Delete"), keybindStr("Backspace")], () => {
			roomSelection.forEach(s => {
				switch (s.type) {
					case "room": {
						console.warn("Cannot delete room bounds (???)");
						return;
					}
					case "object": {
						dispatchMap({
							type: "remove_object",
							target: s.id
						});
						dispatchSelection({
							type: "remove_item",
							item: s,
						});
					}
				}
			});
		}],

		// #region WASD camera movement
		[keybindStr("KeyW"), () => translateCamera(vec2(0, -5))],
		[keybindStr("KeyA"), () => translateCamera(vec2(-5, 0))],
		[keybindStr("KeyS"), () => translateCamera(vec2(0, 5))],
		[keybindStr("KeyD"), () => translateCamera(vec2(5, 0))],
		// #endregion

		// #region Arrow selection movement
		[keybindStr("ArrowUp"), () => translateSelected(vec2(0, -1))],
		[keybindStr("ArrowLeft"), () => translateSelected(vec2(-1, 0))],
		[keybindStr("ArrowDown"), () => translateSelected(vec2(0, 1))],
		[keybindStr("ArrowRight"), () => translateSelected(vec2(1, 0))],
		// #endregion

		[keybindStr("ctrl+ArrowLeft"), () => {
			const ids: (ID | null)[] = map.rooms.keys().toArray();
			const index = ids.indexOf(state.currentRoomId);
			const prevRoomId = ids.at(index - 1) ?? null;
			dispatchView({
				type: "set_current_room_id",
				currentRoomId: prevRoomId,
			})
		}, { preventDefault: true }],
		[keybindStr("ctrl+ArrowRight"), () => {
			const ids: (ID | null)[] = map.rooms.keys().toArray();
			const index = ids.indexOf(state.currentRoomId);
			const nextRoomId = ids.at((index + 1) % ids.length) ?? null;
			dispatchView({
				type: "set_current_room_id",
				currentRoomId: nextRoomId,
			})
		}, { preventDefault: true }],
	]);
	// #endregion

	const className = toClassName(
		css["viewport"],
		dragging && css["dragging"]
	);
	const listeners = mergeListeners(
		contextMenu,
		moveDragListeners,
		selectDragListeners,
		{
			onWheel, onClick, onKeyDown,
		}
	);

	return (
		<div ref={viewportElRef} className={className}
			tabIndex={0}
			{...listeners}

			style={{
				"--viewport-x": `${camera.x}px`,
				"--viewport-y": `${camera.y}px`,
				"--viewport-scale": `${camera.scale}`,
			}}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers} />

			<ActiveSelection {...{ viewportInfo, dispatchView }} />

			{selectDragging && <div className={css["selection"]} style={{
				"--selection-start-x": `${selectBounds.left}px`,
				"--selection-start-y": `${selectBounds.top}px`,
				"--selection-end-x": `${selectBounds.right}px`,
				"--selection-end-y": `${selectBounds.bottom}px`,
			}} />}

			<ViewToolbar ref={toolbarRef}>
				{viewSwitcher}
				<ViewportRoomSwitcher selectedRoom={state.currentRoomId} {...{ dispatchView }} />
			</ViewToolbar>
		</div>
	);
}
