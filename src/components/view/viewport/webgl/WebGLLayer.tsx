import { useEffect, useRef } from "react";
import { ViewportInfo, ViewportLayerFC } from "../Viewport.tsx";
import { WebGLRenderer } from "./webgl.ts";
import { div, mul, Vec2, vec2 } from "../../../../common/vector.ts";


export type WebGLViewportInfo = {
	canvasSize: Vec2;
	cameraSize: Vec2;
};
export type WebGLLayerRendererParams = [
	viewportInfo: ViewportInfo,
	webGlInfo: WebGLViewportInfo,
];
export abstract class WebGLLayerRenderer extends WebGLRenderer<WebGLLayerRendererParams> { };

export const WebGLLayer = (...renderers: WebGLLayerRenderer[]): ViewportLayerFC => ({
	viewportInfo,
}) => {
	const abortRenderRef = useRef<AbortController>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const viewportInfoRef = useRef(viewportInfo);
	useEffect(() => {
		viewportInfoRef.current = viewportInfo;
	}, [viewportInfo]);

	const cleanup = () => {
		const abortRender = abortRenderRef.current;
		if (!abortRender) {
			throw new Error("Attempted to stop rendering, but could not find render abort controller");
		}
		abortRender.abort();
		renderers.forEach(renderer => renderer.cleanup())
		abortRenderRef.current = undefined;
		return;
	}
	const initRenderers = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			cleanup();
			throw new Error("canvasRef was empty");
		}

		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw new Error("WebGL2 is not supported.");
		}

		renderers.forEach(renderer => renderer.init(gl));

		const abortRender = new AbortController();
		abortRenderRef.current = abortRender;

		const render = (t: DOMHighResTimeStamp) => {
			if (abortRender.signal.aborted) return;

			const viewportInfo = viewportInfoRef.current;
			const { camera } = viewportInfo;

			const clientRect = canvas.getBoundingClientRect();
			if (!clientRect) {
				throw new Error("Could not get bounding client rect of canvas parent");
			}
			const canvasCssSize = vec2(clientRect.width, clientRect.height);
			const canvasSize = mul(canvasCssSize, window.devicePixelRatio);

			const resizeWidth = canvas.width !== canvasSize[0];
			const resizeHeight = canvas.height !== canvasSize[1];
			if (resizeWidth) canvas.width = canvasSize[0];
			if (resizeHeight) canvas.height = canvasSize[1];
			if (resizeWidth || resizeHeight) gl.viewport(0, 0, canvasSize[0], canvasSize[1]);

			const cameraSize = div(mul(camera.getBounds(canvasSize).size, vec2(1, -1)), camera.scale);
			const webGlViewportInfo: WebGLViewportInfo = {
				canvasSize,
				cameraSize,
			};

			const errors = renderers.map(renderer => {
				try {
					renderer.render(viewportInfo, webGlViewportInfo);
					return null;
				} catch (error) {
					return error;
				}
			}).filter(x => x !== null);

			if (errors.length) {
				cleanup();
				throw new Error(`Error(s) in WebGL rendering: ${errors}`, { cause: errors });
			}

			window.requestAnimationFrame(render);
		};
		window.requestAnimationFrame(render);
		
		return cleanup;
	};
	useEffect(initRenderers, []);
	return (
		<canvas ref={canvasRef}>
			Canvas not supported :/
		</canvas>
	);
}