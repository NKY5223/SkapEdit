import { useEffect, useRef, useState } from "react";
import { ViewportInfo, ViewportLayerFC } from "../Viewport.tsx";
import { WebGlRenderer } from "./webgl.ts";
import { Vec2, vec2 } from "../../../../common/vec2.ts";
import { tlog } from "@common/string.ts";


export type WebGLViewportInfo = {
	canvasSize: Vec2;
	cameraSize: Vec2;
};
export type WebGLLayerRendererParams = [
	viewportInfo: ViewportInfo,
	webGlInfo: WebGLViewportInfo,
];
export abstract class WebGLLayerRenderer extends WebGlRenderer<WebGLLayerRendererParams> { };

export const WebGLLayer = (...renderers: WebGLLayerRenderer[]): ViewportLayerFC => ({
	viewportInfo,
}) => {
	const abortRenderRef = useRef<AbortController>();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const viewportInfoRef = useRef(viewportInfo);
	useEffect(() => {
		viewportInfoRef.current = viewportInfo;
	}, [viewportInfo]);

	const initRenderers = () => {
		const cleanup = () => {
			const abortRender = abortRenderRef.current;
			if (!abortRender) {
				renderers.forEach(renderer => renderer.cleanup());
				throw new Error("Attempted to stop rendering, but could not find render abort controller");
			}
			abortRender.abort();
			renderers.forEach(renderer => renderer.cleanup());
			abortRenderRef.current = undefined;

			return;
		}

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
		
		let prev = 0;
		const render = (t: DOMHighResTimeStamp) => {
			if (abortRender.signal.aborted) return;

			const viewportInfo = viewportInfoRef.current;
			const { camera, viewportSize } = viewportInfo;

			const canvasSize = viewportSize;
			const resolution = window.devicePixelRatio;
			const muledSize = canvasSize.mul(resolution);

			const resizeWidth = Math.abs(canvas.width - muledSize[0]) >= 1;
			const resizeHeight = Math.abs(canvas.height - muledSize[1]) >= 1;
			if (resizeWidth) canvas.width = muledSize[0];
			if (resizeHeight) canvas.height = muledSize[1];
			if (resizeWidth || resizeHeight) {
				gl.viewport(0, 0, muledSize[0], muledSize[1]);
			}

			const cameraSize = camera.getBounds(canvasSize).size.mul(vec2(1, -1));
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
		<canvas ref={canvasRef} />
	);
}