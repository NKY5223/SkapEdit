import { Layout } from "@components/layout/Layout.tsx";
import { Bounds } from "@editor/bounds.ts";
import { useElementSize } from "@hooks/useElementSize.ts";
import React, { FC, useMemo, useRef, useState } from "react";
import { Vec2, zero } from "@common/vec2.ts";
import "@common/vector.ts";
import { SkapRoom, useSkapMap } from "../../../editor/map.ts";
import { useDrag } from "@hooks/useDrag.ts";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import { Camera, useCamera } from "./camera.ts";
import { BackgroundObstacleWebGLRenderer, BackgroundWebGLRenderer } from "./renderer/background.ts";
import { LavaWebGLRenderer } from "./renderer/lava.ts";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import { TextLayer } from "./renderer/text.tsx";
import css from "./Viewport.module.css";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";

export type ViewportInfo = {
	camera: Camera;
	/** canvas size, in css px */
	viewportSize: Vec2;
	/** camera bounds, in map units */
	viewportBounds: Bounds;
	room: SkapRoom;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
	viewportInfo: ViewportInfo;
	onPointerDown?: React.PointerEventHandler;
	onWheel?: React.WheelEventHandler;
};
const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers, viewportInfo,
	onPointerDown, onWheel,
}) => {
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
	return (
		<div className={css["viewport-canvas"]} onPointerDown={onPointerDown} onWheel={onWheel}>
			{
				layers.map((Layer, i) => (
					<Layer key={i} viewportInfo={viewportInfo} />
				))
			}
		</div>
	);
}

/** uhhh i forgor */
const wheelMult = (mode: number): number => {
	switch (mode) {
		case 0x00: return 1;
		case 0x01: return 2;
		case 0x02: return 5;
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
	const { handlePointerDown } = useDrag(1, null, (curr, prev) => {
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

	const viewportSize = useElementSize(elRef);
	const viewportBounds = camera.getBounds(viewportSize);

	const room = map.rooms.values().next().value;
	if (!room) {
		throw new Error("Map has no rooms");
	}
	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		room,
		viewportBounds,
	};

	return (
		<div ref={elRef} className={css["viewport"]}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers}
				onPointerDown={handlePointerDown} onWheel={handleWheel} />
			<ViewToolbar classes={[css["viewport-topbar"]]}>
				{viewSwitch}
			</ViewToolbar>
		</div>
	);
}

