import { useEffect, useEffectEvent, useRef } from "react";
import { ViewportInfo, ViewportLayerFC } from "../Viewport.tsx";
import { WebGlRenderer } from "./webgl.ts";
import { Vec2, vec2 } from "../../../../common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";


export type WebGLViewportInfo = {
	canvasSize: Vec2;
	cameraSize: Vec2;
	/** Canvas bounds, in map units */
	canvasBounds: Bounds;
	/** Time since reset, in seconds */
	time: number;
};
export type WebGLLayerRendererParams = [
	viewportInfo: ViewportInfo,
	webGlInfo: WebGLViewportInfo,
];
export abstract class WebGLLayerRenderer extends WebGlRenderer<WebGLLayerRendererParams> {
	enableDefaultBlend(gl: WebGL2RenderingContext) {
		gl.enable(gl.BLEND);
		gl.blendFuncSeparate(
			gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
			gl.ZERO, gl.ONE,
		);
	}
	disableBlend(gl: WebGL2RenderingContext) {
		gl.disable(gl.BLEND);
	}
};

const resizeInterval = 1000;

export const WebGLLayer = (...renderers: WebGLLayerRenderer[]): ViewportLayerFC => {
	const WebGLLayer: ViewportLayerFC = ({
		viewportInfo,
	}) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

		const render = useEffectEvent(({
			canvas, gl,
			curr, prev, accDt,
			abortRender, cleanup,
		}: {
			canvas: HTMLCanvasElement;
			gl: WebGL2RenderingContext;

			curr: DOMHighResTimeStamp;
			prev: DOMHighResTimeStamp;
			accDt: number;

			abortRender: AbortController;
			cleanup: () => void;
		}) => {
			if (abortRender.signal.aborted) return;

			const dt = curr - prev;
			prev = curr;
			accDt += dt;

			const { camera, viewportSize, timeOrigin } = viewportInfo;
			const resolution = window.devicePixelRatio;
			const muledSize = viewportSize.mul(resolution);
			// Resizing canvas is extremely costly. Only resize it occasionally
			if (accDt >= resizeInterval) {
				accDt = 0;

				const canvasRect = canvas.getBoundingClientRect();
				Object.assign(window, { viewportInfo });
				const resizeStyleWidth = Math.abs(canvasRect.width - viewportSize[0]) >= 1;
				const resizeStyleHeight = Math.abs(canvasRect.height - viewportSize[1]) >= 1;
				if (resizeStyleWidth) canvas.style.width = `${viewportSize[0]}px`;
				if (resizeStyleHeight) canvas.style.height = `${viewportSize[1]}px`;

				const resizeWidth = Math.abs(canvas.width - muledSize[0]) >= 1;
				const resizeHeight = Math.abs(canvas.height - muledSize[1]) >= 1;
				if (resizeWidth) canvas.width = muledSize[0];
				if (resizeHeight) canvas.height = muledSize[1];
				if (resizeWidth || resizeHeight) {
					gl.viewport(0, 0, muledSize[0], muledSize[1]);
				}
			}

			const canvasSize = vec2(canvas.width, canvas.height).div(resolution);
			const canvasBounds = camera.getBounds(canvasSize);
			const cameraSize = camera.getBounds(canvasSize).size.mul(vec2(1, -1));

			const time = (performance.now() - timeOrigin) / 1000;

			const webGlViewportInfo: WebGLViewportInfo = {
				canvasSize,
				cameraSize,
				canvasBounds,
				time,
			};
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

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

			window.requestAnimationFrame(t => render({
				curr: t, prev: curr, accDt,
				canvas, gl,
				abortRender, cleanup,
			}));
		});

		const initRenderers = () => {
			const abortRender = new AbortController();
			
			const cleanup = () => {
				if (!abortRender) {
					renderers.forEach(renderer => renderer.cleanup());
					throw new Error("Attempted to stop rendering, but could not find render abort controller");
				}
				abortRender.abort();
				renderers.forEach(renderer => renderer.cleanup());
				return;
			}

			const canvas = canvasRef.current;
			if (!canvas) {
				cleanup();
				throw new Error("canvasRef was empty");
			}

			const gl = canvas.getContext("webgl2", {
				premultipliedAlpha: false,
			});
			if (!gl) {
				throw new Error("WebGL2 is not supported.");
			}

			renderers.forEach(renderer => renderer.init(gl));

			window.requestAnimationFrame(t => render({
				curr: t, prev: 0, accDt: Infinity,
				canvas, gl,
				abortRender, cleanup,
			}));

			return cleanup;
		};
		useEffect(initRenderers, []);
		return (
			<canvas ref={canvasRef} />
		);
	}
	return WebGLLayer;
}