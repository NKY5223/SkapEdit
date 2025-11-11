import { sortBy } from "@common/array.ts";
import { vec2 } from "@common/vec2.ts";
import { Sections, makeSection, makeSingle, makeSubmenu, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { makeObjectSelectableItem, makeObjectSelectionItem, makeRoomSelectableItem, selectableToSelection, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { mergeListeners, toClassName } from "@components/utils.tsx";
import { Bounds } from "@editor/bounds.ts";
import { SkapRoom, makeCardinalGravityZone, makeGravityZone, makeIce, makeLava, makeObstacle, makeRotatingLava, makeSlime, makeText } from "@editor/map.ts";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { useElementSize } from "@hooks/useElementSize.ts";
import { Dispatch, FC, ReactNode, useMemo, useRef } from "react";
import { viewportToMap } from "./mapping.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { BlockWebGLRenderer } from "./renderer/block.ts";
import { GravityZoneWebGLRenderer } from "./renderer/gravityZone.ts";
import { IceWebGLRenderer } from "./renderer/ice.ts";
import { LavaWebGLRenderer, RotatingLavaWebGLRenderer } from "./renderer/lava.ts";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { SlimeWebGLRenderer } from "./renderer/slime.ts";
import { TeleporterWebGLRenderer } from "./renderer/teleporter.ts";
import { TextLayer } from "./renderer/text.tsx";
import { ActiveSelection } from "./selection/ActiveSelection.tsx";
import { getClickbox, getSelectableBounds, getZIndex } from "./selection/getObjectProperties.ts";
import css from "./Viewport.module.css";
import { ViewportAction, ViewportInfo, ViewportState, wheelMult } from "./Viewport.tsx";
import { ViewportCanvas } from "./ViewportCanvas.tsx";
import { ViewportRoomSwitcher } from "./ViewportRoomSwitcher.tsx";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { SpawnerBackgroundWebGLRenderer, SpawnerEntitiesWebGLRenderer } from "./renderer/spawner.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";


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
			new TeleporterWebGLRenderer(),
			new LavaWebGLRenderer(),
			new RotatingLavaWebGLRenderer(),
			new IceWebGLRenderer(),
			new SlimeWebGLRenderer(),
			// Buttons
			// Switches
			// Doors
			// door links
			new BlockWebGLRenderer(0),
			// Particles
			new SpawnerEntitiesWebGLRenderer(),
			// Turrets
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
	const selectables = [
		...objectSelectables,
		makeRoomSelectableItem(room),
	];

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
			makeSubmenu("viewport.add_object", "add", [
				makeSingle("viewport.add_object.obstacle", "obstacle", () => {
					const object = makeObstacle(0, 0, 10, 10);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.lava", "square", () => {
					const object = makeLava(0, 0, 10, 10);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.slime", "square", () => {
					const object = makeSlime(0, 0, 10, 10);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.ice", "square", () => {
					const object = makeIce(0, 0, 10, 10);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.text", "text_fields", () => {
					const object = makeText(0, 0, "|");
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.gravityZone", null, () => {
					const object = makeCardinalGravityZone(0, 0, 10, 10, CardinalDirection.Down);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
				}),
				makeSingle("viewport.add_object.rotatingLava", null, () => {
					const object = makeRotatingLava(0, 0, 10, 10, vec2(5, 5), 0, 90);
					dispatchMap({
						type: "add_object",
						roomId: room.id,
						object,
					});
					dispatchSelection({
						type: "set_selection",
						selection: [makeObjectSelectionItem(object)]
					});
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
			selectables.filter(obj => getClickbox(obj, clickPos)),
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
			const newselect = selectables.filter(s => selectBounds.containsBounds(getSelectableBounds(s)));
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

	// #region Hotkeys
	const onKeyDown: React.KeyboardEventHandler = e => {
		if (e.code === "Delete" || e.code === "Backspace") {
			selection.forEach(s => {
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
							itemId: s.id,
						});
					}
				}
			});
		}
		if (e.code === "KeyA" && e.ctrlKey) {
			e.preventDefault();
			const newSelection = objectSelectables.map(selectableToSelection);
			dispatchSelection({
				type: "set_selection",
				selection: newSelection,
			});
		}
		if (e.code === "Escape") {
			dispatchSelection({
				type: "clear_selection"
			});
		}
		if (e.code === "KeyW") {
			dispatchView({
				type: "set_camera_pos",
				pos: camera.pos.add(vec2(0, -5)),
			});
		}
		if (e.code === "KeyA") {
			dispatchView({
				type: "set_camera_pos",
				pos: camera.pos.add(vec2(-5, 0)),
			});
		}
		if (e.code === "KeyS") {
			dispatchView({
				type: "set_camera_pos",
				pos: camera.pos.add(vec2(0, 5)),
			});
		}
		if (e.code === "KeyD") {
			dispatchView({
				type: "set_camera_pos",
				pos: camera.pos.add(vec2(5, 0)),
			});
		}
	};
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
