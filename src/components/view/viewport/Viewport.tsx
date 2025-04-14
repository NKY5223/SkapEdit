import { FC, useDebugValue, useMemo, useRef, useState } from "react";
import { Camera, useCamera } from "./camera.ts";
import { ViewFC } from "../../layout/LayoutView.tsx";
import { SkapMap, useMap } from "../../../editor/map.ts";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import css from "./Viewport.module.css";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import "../../../common/vector.ts";
import { Vec2, zero } from "../../../common/vec2.ts";
import { useDrag } from "../../../hooks/useDrag.ts";
import { TextLayer } from "./renderer/text.tsx";
import { useElementSize } from "@hooks/useElementSize.ts";
import { tlog } from "@common/string.ts";

export type ViewportInfo = {
	camera: Camera;
	viewportSize: Vec2;
	map: SkapMap;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
	viewportInfo: ViewportInfo;
};
export const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers, viewportInfo
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
		<div className={css["viewport-canvas"]}>
			{
				layers.map((Layer, i) => (
					<Layer key={i} viewportInfo={viewportInfo} />
				))
			}
		</div>
	);
}

// #region Conversion
/**
 * Converts a `Vec2` from viewport space to map space.
 * Is the inverse of `mapToViewport`.
 * 
 * E.g. with `500x500` viewport, camera at `⟨10, 0⟩ ×5`:
 * ```ts
 * viewportToMap(info, vec2(250, 250)) ⇒ ⟨10, 0⟩;
 * viewportToMap(info, vec2(300, 325)) ⇒ ⟨20, 15⟩;
 */
export const viewportToMap = (info: ViewportInfo, pos: Vec2): Vec2 => {
	const { camera, viewportSize } = info;
	return pos.sub(viewportSize.div(2)).div(camera.scale).add(camera.pos);
}
/**
 * Converts a `Vec2` from map space to viewport space.  
 * Is the inverse of `viewportToMap`.
 * 
 * E.g. with `500x500` viewport, camera at `⟨10, 0⟩ ×5`:
 * ```ts
 * mapToViewport(info, vec2(0, 0)) ⇒ ⟨200, 250⟩;
 * mapToViewport(info, vec2(10, 15)) ⇒ ⟨250, 325⟩;
 * ```
 */
export const mapToViewport = (info: ViewportInfo, pos: Vec2): Vec2 => {
	const { camera, viewportSize } = info;
	return viewportSize.div(2).add(pos.sub(camera.pos).mul(camera.scale));
}
// #endregion

const wheelMult = (mode: number): number => {
	switch (mode) {
		case 0x00: return 1;
		case 0x01: return 2;
		case 0x02: return 5;
		default: return 1;
	}
};
const scaleBase = 5;
const scaleMul = -1 / 100;
const scaleExp = 1.25;

export const Viewport: ViewFC = ({
	children,
}) => {
	const elRef = useRef<HTMLDivElement>(null);
	const map = useMap();
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
		const newScale = scaleBase * scaleExp ** (scaleMul * newIndex);
		
		setScaleIndex(newIndex);
		setCamera({
			scale: newScale
		});
	}

	const viewportSize = useElementSize(elRef);

	const viewportInfo: ViewportInfo = {
		camera,
		viewportSize,
		map,
	};

	const layers = useMemo(() => [
		WebGLLayer(
			new ObstacleWebGLRenderer()
		),
		TextLayer
	], []);
	return (
		<div ref={elRef} className={css["viewport"]} 
		onPointerDown={handlePointerDown} onWheel={handleWheel}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers} />
			<ViewToolbar classes={[css["viewport-topbar"]]}>
				{children}
			</ViewToolbar>
		</div>
	);
}