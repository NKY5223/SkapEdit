import { sortBy } from "@common/array.ts";
import { vec2, Vec2, zero } from "@common/vec2.ts";
import "@common/vector.ts";
import { makeSection, makeSingle, makeSubmenu, Sections, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { makeObjectSelectableItem, makeObjectSelectionItem, makeRoomSelectableItem, selectableToSelection, useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { Layout } from "@components/layout/layout.ts";
import { mergeListeners, toClassName } from "@components/utils.tsx";
import { Bounds } from "@editor/bounds.ts";
import { useDispatchSkapMap, useSkapMap } from "@editor/reducer.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { useElementSize } from "@hooks/useElementSize.ts";
import React, { FC, useMemo, useRef, useState } from "react";
import { makeObstacle, SkapRoom } from "../../../editor/map.ts";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import { Camera, useCamera } from "./camera.ts";
import { viewportToMap } from "./mapping.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { LavaWebGLRenderer } from "./renderer/lava.ts";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { TextLayer } from "./renderer/text.tsx";
import { ActiveSelection } from "./selection/ActiveSelection.tsx";
import { getClickbox, getSelectableBounds, getZIndex } from "./selection/getObjectProperties.ts";
import css from "./Viewport.module.css";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";

export type ViewportInfo = {
	camera: Camera;
	/** viewport size, in css px */
	viewportSize: Vec2;
	/** viewport position relative to screen, in css px */
	viewportPos: Vec2;
	/** camera bounds, in map units */
	viewportBounds: Bounds;
	room: SkapRoom;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

/* 
Desired structure:
layers:
	webgl {
		gl
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
		gl and renderers **MUST** persist across renders
		else contexts will probably be lost all the time idk
	}
	text {
		probably just a regular React.FC
	}
	webgl {
		gl
		renderer { ... }
	}
*/
type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
	viewportInfo: ViewportInfo;
} & React.HTMLAttributes<HTMLDivElement>;
const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers, viewportInfo,
	...attrs
}) => {
	return (
		<div className={css["viewport-canvas"]} {...attrs}>
			{
				layers.map((Layer, i) => (
					<Layer key={i} viewportInfo={viewportInfo} />
				))
			}
		</div>
	);
}

/** multiplier for wheel event "mode"
 * will almost always be 0
 */
const wheelMult = (mode: number): number => {
	switch (mode) {
		case 0: return 1;
		case 1: return 2;
		case 2: return 5;
		default: return 1;
	}
};
const scaleBase = 5;
// one "tick" of the mouse wheel is 100 units, and -1 to flip directions
const scaleMul = -1 / 100;
const scaleExp = 1.25;
const calcScale = (i: number) => scaleBase * scaleExp ** (scaleMul * i);

export const Viewport: Layout.ViewComponent = ({
	viewSwitch,
}) => {
	// useMemo because the webgl canvas should persist
	const layers = useMemo(() => [
		WebGLLayer(
			new BackgroundObstacleWebGLRenderer(),
			new BackgroundWebGLRenderer(),
			new ObstacleWebGLRenderer(),
			new LavaWebGLRenderer(),
		),
		TextLayer
	], []);

	const elRef = useRef<HTMLDivElement>(null);
	const map = useSkapMap();
	const dispatchMap = useDispatchSkapMap();

	const selection = useEditorSelection();
	const dispatchSelection = useDispatchSelection();

	const room = map.rooms.values().next().value;
	if (!room) {
		throw new Error("Map has no rooms");
	}

	// #region Camera
	const [scaleIndex, setScaleIndex] = useState(0);
	const [camera, setCamera] = useCamera({ pos: zero, scale: scaleBase });
	const { dragging, listeners: moveDragListeners } = useDrag({
		buttons: MouseButtons.Middle,
		onDrag: (curr, prev) => {
			setCamera(camera => {
				const diff = curr.sub(prev).div(camera.scale);
				return {
					pos: camera.pos.sub(diff),
				};
			});
		}
	});
	const onWheel: React.WheelEventHandler<HTMLElement> = e => {
		const d = e.deltaY * wheelMult(e.deltaMode);
		const newIndex = scaleIndex + d;
		const newScale = calcScale(newIndex);

		setScaleIndex(newIndex);
		setCamera({
			scale: newScale
		});
	}
	// #endregion

	const contextMenu = useContextMenu([
		makeSection(Sections.viewport, [
			makeSingle("viewport.reset_camera", "reset_shutter_speed", () => {
				setScaleIndex(0);
				setCamera({
					x: 0, y: 0, scale: 5,
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
				})
			])
		]),
	]);

	const viewportSize = useElementSize(elRef);
	const rect = elRef.current?.getBoundingClientRect();
	const viewportPos = vec2(rect?.left ?? 0, rect?.top ?? 0);
	const viewportBounds = camera.getBounds(viewportSize);

	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		viewportPos,
		room,
		viewportBounds,
	};


	const selectables = [
		...room.objects.values().map(makeObjectSelectableItem),
		makeRoomSelectableItem(room),
	];

	// #region Single-item selection
	const onClick: React.MouseEventHandler = e => {
		// Must be a click originating in this element
		if (e.target !== e.currentTarget) return;

		// Mouse position diff (pixels)
		const diff = selectDragInitial.sub(selectDragCurrent).mul(viewportSize);
		// Must be within 2px (i.e. not dragging to select)
		if (diff.mag() > 2) return;

		const { left, top } = e.currentTarget.getBoundingClientRect();
		const clickPos = viewportToMap(viewportInfo, vec2(e.clientX - left, e.clientY - top));

		const clickedItems = sortBy(
			selectables.filter(obj => getClickbox(obj, clickPos)),
			getZIndex,
			// Descending order of z-index
			(a, b) => b - a
		);

		const item = clickedItems[0];
		if (!item) {
			dispatchSelection({
				type: "clear_selection",
			});
			return;
		}
		if (e.shiftKey) {
			dispatchSelection({
				type: "add_item",
				item: selectableToSelection(item)
			});
		} else {
			dispatchSelection({
				type: "set_selection",
				selection: [selectableToSelection(item)]
			});
		}
	}
	// #endregion

	const className = toClassName(
		css["viewport"],
		dragging && css["dragging"],
	);

	// #region Multi-item selection
	const {
		dragging: selectDragging,
		listeners: selectDragListeners,
		beforeDrag: selectDragInitial,
		currentPos: selectDragCurrent,
	} = useDrag({
		buttons: MouseButtons.Left,
		normalizeToUnit: elRef,
		onEndDrag: e => {
			const newselect = selectables.filter(s => selectBounds.containsBounds(getSelectableBounds(s)));
			console.log("a");
			dispatchSelection({
				type: "set_selection",
				selection: newselect.map(selectableToSelection)
			});
		}
	});
	const selectBounds = Bounds.fromCorners(
		viewportBounds.lerp(selectDragInitial),
		viewportBounds.lerp(selectDragCurrent),
	);
	// #endregion

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
			dispatchSelection({
				type: "set_selection",
				selection: selectables.map(selectableToSelection)
			});
		}
		if (e.code === "Escape") {
			dispatchSelection({
				type: "clear_selection"
			});
		}
	}

	const listeners = mergeListeners(
		contextMenu,
		moveDragListeners,
		selectDragListeners,
		{
			onWheel, onClick, onKeyDown
		},
	);

	return (
		<div ref={elRef} className={className}
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
				{viewSwitch}
			</ViewToolbar>
		</div>
	);
}