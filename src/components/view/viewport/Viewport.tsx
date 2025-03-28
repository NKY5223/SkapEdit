import { FC, useMemo, useState } from "react";
import { Camera, useCamera } from "./Camera.ts";
import { ViewFC } from "../../layout/LayoutView.tsx";
import { SkapMap, useMap } from "../../editor/map.ts";
import { zeroVec } from "../../../common/vector.ts";
import { WebGLLayer } from "./webgl/WebGLLayer.tsx";
import { ObstacleWebGLRenderer } from "./renderer/obstacle.ts";
import css from "./Viewport.module.css";
import { ViewToolbar, ViewToolbarButton } from "../../layout/LayoutViewToolbar.tsx";
import "../../../common/vectorN.ts";


export type ViewportInfo = {
	camera: Camera;
	map: SkapMap;
}
export type ViewportLayerFC = FC<{
	viewportInfo: ViewportInfo;
}>;

type ViewportCanvasProps = {
	layers: ViewportLayerFC[];
};
export const ViewportCanvas: FC<ViewportCanvasProps> = ({
	layers
}) => {
	const map = useMap();

	const [camera] = useCamera({ pos: zeroVec, scale: 5 });

	const viewportInfo: ViewportInfo = {
		camera,
		map,
	};

	/* 
	Desired structure:
	<viewport>
	<webgl /> {
		gl
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
		renderer { shared gl, shaders, program, buffers etc... }
	}
	<text />
	<webgl /> {
		gl
		renderer { ... }
	}
	</viewport>
	gl and renderers **MUST** persist across renders
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
	const [key, setKey] = useState(Math.random());
	const layers = useMemo(() => [
		WebGLLayer(
			new ObstacleWebGLRenderer()
		)
	], []);
	return (
		<div className={css["viewport"]}>
			<ViewportCanvas key={key} layers={layers} />
			<ViewToolbar classes={[css["viewport-topbar"]]}>
				{children}
				<ViewToolbarButton onClick={() => setKey(Math.random())}>Reload</ViewToolbarButton>
			</ViewToolbar>
		</div>
	);
}