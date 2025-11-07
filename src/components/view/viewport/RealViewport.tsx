import { sortBy } from "@common/array.ts";
import { ID } from "@common/uuid.ts";
import { vec2 } from "@common/vec2.ts";
import { Vector } from "@common/vector.ts";
import { EditorSelection, SelectionItem, makeObjectSelectableItem, makeObjectSelectionItem, makeRoomSelectableItem, selectableToSelection, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { ViewToolbar } from "@components/layout/LayoutViewToolbar.tsx";
import { ListenerAttributes, toClassName, mergeListeners } from "@components/utils.tsx";
import { Bounds } from "@editor/bounds.ts";
import { SkapRoom, SkapMap, SkapObject, makeLava, makeObstacle, makeText } from "@editor/map.ts";
import { useDrag, MouseButtons } from "@hooks/useDrag.ts";
import { Camera } from "./camera.ts";
import { viewportToMap } from "./mapping.ts";
import { ActiveSelection } from "./selection/ActiveSelection.tsx";
import { getClickbox, getZIndex, getSelectableBounds } from "./selection/getObjectProperties.ts";
import { ViewportLayerFC, ViewportInfo, ViewportState, ViewportAction, wheelMult } from "./Viewport.tsx";
import { ViewportCanvas } from "./ViewportCanvas.tsx";
import css from "./Viewport.module.css";
import { Dispatch, FC, ReactNode, useMemo, useRef } from "react";
import { useContextMenu, makeSection, Sections, makeSingle, makeSubmenu } from "@components/contextmenu/ContextMenu.ts";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { IceWebGLRenderer } from "./renderer/ice.ts";
import { LavaWebGLRenderer } from "./renderer/lava.ts";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { SlimeWebGLRenderer } from "./renderer/slime.ts";
import { TextLayer } from "./renderer/text.tsx";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { useElementSize } from "@hooks/useElementSize.ts";
import { ViewportRoomSwitcher } from "./ViewportRoomSwitcher.tsx";


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
	// useMemo because the webgl canvas should persist
	const layers = useMemo(() => [
		WebGLLayer(
			new BackgroundObstacleWebGLRenderer(),
			new BackgroundWebGLRenderer(),
			new ObstacleWebGLRenderer(),
			new LavaWebGLRenderer(),
			new SlimeWebGLRenderer(),
			new IceWebGLRenderer(),
		),
		TextLayer
	], []);

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
	};

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

			<ActiveSelection viewportInfo={viewportInfo} />

			{selectDragging && <div className={css["selection"]} style={{
				"--selection-start-x": `${selectBounds.left}px`,
				"--selection-start-y": `${selectBounds.top}px`,
				"--selection-end-x": `${selectBounds.right}px`,
				"--selection-end-y": `${selectBounds.bottom}px`,
			}} />}

			<ViewToolbar>
				{viewSwitcher}
				<ViewportRoomSwitcher selectedRoom={state.currentRoomId} {...{ dispatchView }} />
			</ViewToolbar>
		</div>
	);
}
