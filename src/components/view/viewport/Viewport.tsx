import { Layout } from "@components/layout/layout.ts";
import { Bounds } from "@editor/bounds.ts";
import { useElementSize } from "@hooks/useElementSize.ts";
import React, { FC, useMemo, useRef, useState } from "react";
import { vec2, Vec2, zero } from "@common/vec2.ts";
import "@common/vector.ts";
import { SkapRoom, useSkapMap } from "../../../editor/map.ts";
import { MouseButtons, useDrag } from "@hooks/useDrag.ts";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import { Camera, useCamera } from "./camera.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { LavaWebGLRenderer } from "./renderer/lava.ts";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { TextLayer } from "./renderer/text.tsx";
import css from "./Viewport.module.css";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { makeSection, Sections, makeSingle } from "@components/contextmenu/ContextMenu.ts";
import { viewportToMap } from "./mapping.ts";
import { useDispatchSelection, useEditorSelection } from "@components/editor/selection.ts";
import { clickbox, zIndex } from "./objectProperties.ts";
import { sortBy } from "@common/array.ts";
import { ActiveSelection } from "./ActiveSelection.tsx";
import { toClassName } from "@components/utils.tsx";

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
	const [scaleIndex, setScaleIndex] = useState(0);
	const [camera, setCamera] = useCamera({ pos: zero, scale: scaleBase });
	const { dragging, onPointerDown } = useDrag(MouseButtons.Middle, null, (curr, prev) => {
		setCamera(camera => {
			const diff = curr.sub(prev).div(camera.scale);
			return {
				pos: camera.pos.sub(diff),
			};
		});
	});
	const handleWheel: React.WheelEventHandler<HTMLElement> = e => {
		const d = e.deltaY * wheelMult(e.deltaMode);
		const newIndex = scaleIndex + d;
		const newScale = calcScale(newIndex);

		setScaleIndex(newIndex);
		setCamera({
			scale: newScale
		});
	}

	const contextMenu = useContextMenu([
		makeSection(Sections.viewport, [
			makeSingle("viewport.reset_camera", "reset_shutter_speed", () => {
				setScaleIndex(0);
				setCamera({
					x: 0, y: 0, scale: 5,
				});
			}),
			// submenu("viewport.do_stuff", null, [
			// 	single("viewport.do_stuff.0"),
			// 	single("viewport.do_stuff.1"),
			// 	single("viewport.do_stuff.2"),
			// 	single("viewport.do_stuff.3"),
			// ]),
		]),
	]);

	const viewportSize = useElementSize(elRef);
	const rect = elRef.current?.getBoundingClientRect();
	const viewportPos = vec2(rect?.left ?? 0, rect?.top ?? 0);
	const viewportBounds = camera.getBounds(viewportSize);

	const room = map.rooms.values().next().value;
	if (!room) {
		throw new Error("Map has no rooms");
	}
	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		viewportPos,
		room,
		viewportBounds,
	};

	const dispatchSelection = useDispatchSelection();

	const handleClick: React.MouseEventHandler = e => {
		// Must be a click originating in this element
		if (e.target !== e.currentTarget) return;

		const { left, top } = e.currentTarget.getBoundingClientRect();
		const clickPos = viewportToMap(viewportInfo, vec2(e.clientX - left, e.clientY - top));

		const clickedObjects = sortBy(
			[...room.objects.values(), room]
				.filter(obj => clickbox(obj, clickPos)),
			zIndex,
			// Descending order of z-index
			(a, b) => b - a
		);

		const obj = clickedObjects[0];
		if (!obj) {
			dispatchSelection({
				type: "set_selection",
				selection: null,
			});
			return;
		}
		const id = obj.id;
		const type = "type" in obj ? "object" : "room";

		dispatchSelection({
			type: "set_selection",
			selection: {
				type, id,
			}
		});
	}

	const className = toClassName(
		css["viewport"],
		dragging && css["dragging"],
	);
	return (
		<div ref={elRef} className={className}
			onPointerDown={onPointerDown} onWheel={handleWheel} onClick={handleClick} {...contextMenu}
			style={{
				"--viewport-x": `${camera.x}px`,
				"--viewport-y": `${camera.y}px`,
				"--viewport-scale": `${camera.scale}`,
			}}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers} />

			<ActiveSelection viewportInfo={viewportInfo} />

			<ViewToolbar>
				{viewSwitch}
			</ViewToolbar>
		</div>
	);
}