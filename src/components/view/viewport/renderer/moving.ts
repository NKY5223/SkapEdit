import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/default.vert?raw";
import { Vec2 } from "@common/vec2.ts";
import { centeredBounds } from "@editor/object/moving.tsx";

export type MovingData = {
	size: Vec2;
	period: number;
	points: readonly {
		pos: Vec2;
		time: number;
	}[];
};

export abstract class MovingRectWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): MovingData[];

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
			const { size, period, points } = rect;
			const t = time % period;
			const sorted = points
				.filter(p => p.time >= 0 && p.time <= period)
				.sort((a, b) => a.time - b.time);
			const first = sorted[0];
			const last = sorted[sorted.length - 1];
			const firstMod = {
				...first,
				time: first.time + period,
			};
			const lastMod = {
				...last,
				time: last.time - period,
			};
			const prev = sorted.findLast(({ time }) => time <= t) ?? lastMod;
			const next = sorted.find(({ time }) => time > t) ?? firstMod;
			const factor = (t - prev.time) / (next.time - prev.time);
			const pos = prev.pos.add(next.pos.sub(prev.pos).mul(factor));
			return centeredBounds(pos, size);
		}).flatMap(rect);

		this.setAttribute2f(gl, "aPosition", pos);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, rects.length * 6);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
