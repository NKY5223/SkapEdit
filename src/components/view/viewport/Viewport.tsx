import { FC, useDebugValue, useMemo, useRef } from "react";
import { Camera, useCamera } from "./camera.ts";
import { ViewFC } from "../../layout/LayoutView.tsx";
import { SkapMap, useMap } from "../../editor/map.ts";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import css from "./Viewport.module.css";
import { ViewToolbar } from "../../layout/LayoutViewToolbar.tsx";
import "../../../common/vector.ts";
import { zero } from "../../../common/vec2.ts";
import { useDrag } from "../../../hooks/drag.ts";
import { tlogRec } from "../../../common/string.ts";


export type ViewportInfo = {
	camera: Camera;
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

export const Viewport: ViewFC = ({
	children,
}) => {
	const map = useMap();
	const [camera, setCamera] = useCamera({ pos: zero, scale: 5 });
	const { handlePointerDown } = useDrag(1, null, (curr, prev) => {
		setCamera(camera => {
			const diff = curr.sub(prev).div(camera.scale / window.devicePixelRatio);
			return {
				pos: camera.pos.sub(diff),
			};
		});
	});

	const viewportInfo: ViewportInfo = {
		camera,
		map,
	};

	const layers = useMemo(() => [
		WebGLLayer(
			new ObstacleWebGLRenderer()
		)
	], []);
	return (
		<div className={css["viewport"]} onPointerDown={handlePointerDown}>
			<ViewportCanvas viewportInfo={viewportInfo} layers={layers} />
			<ViewToolbar classes={[css["viewport-topbar"]]}>
				{children}
			</ViewToolbar>
		</div>
	);
}