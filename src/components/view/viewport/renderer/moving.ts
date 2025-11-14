import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/default.vert?raw";
import { Vec2 } from "@common/vec2.ts";

export abstract class MovingRectWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): {
		bounds: Bounds;
		period: number;
		points: readonly {
			pos: Vec2;
			time: number;
		}[];
	}[];

	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}

	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);

		const {
			cameraSize,
			time,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const rects = this.rects(viewportInfo, webGlViewportInfo);
		const pos = rects.map<Bounds>(rect => {
			const { bounds, period, points } = rect;
			const t = time % period;
			const sorted = points.toSorted((a, b) => a.time - b.time);
			const first = sorted[0];
			const wraparound = {
				...first,
				time: first.time + period,
			};
			const prev = sorted.findLast(({ time }) => time <= t) ?? first;
			const next = sorted.find(({ time }) => time > t) ?? wraparound;
			const factor = (t - prev.time) / (next.time - prev.time);
			const pos = prev.pos.add(next.pos.sub(prev.pos).mul(factor));
			return bounds.translate(pos.sub(first.pos));
		}).flatMap(rect);

		this.setAttribute2f(gl, "aPosition", pos);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, rects.length * 6);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
