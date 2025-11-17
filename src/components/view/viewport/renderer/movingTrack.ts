import { tuplesCyclical } from "@common/array.ts";
import { Color } from "@common/color.ts";
import { ccw90, Vec2 } from "@common/vec2.ts";
import { circleBounds } from "@editor/object/circular.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { MovingData } from "./moving.ts";
import vert from "./shader/default.vert?raw";
import circleVert from "./shader/texture.vert?raw";
import frag from "./shader/solidColor.frag?raw";
import circleFrag from "./shader/solidColorCircle.frag?raw";
import { unitSquareUvs } from "./spawner.ts";

export const line = (a: Vec2, b: Vec2, width: number = 1): Vec2[] => {
	if (a.equal(b)) return [a, a, a, a, a, a];
	const long = a.sub(b);
	const cross = ccw90.mulVec(long).norm(width / 2);
	const topLeft = a.sub(cross);
	const topRight = a.add(cross);
	const bottomLeft = b.sub(cross);
	const bottomRight = b.add(cross);
	return [
		topLeft,
		topRight,
		bottomRight,
		topLeft,
		bottomLeft,
		bottomRight,
	];
}

export abstract class MovingTrackWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Omit<MovingData, "size">[];

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
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const objs = this.rects(viewportInfo, webGlViewportInfo);
		const pos = objs.flatMap(obj => {
			const { period, points } = obj;
			const valid = points
				.filter(p => p.time >= 0 && p.time <= period)
				.sort((a, b) => a.time - b.time);
			return tuplesCyclical(valid, 2).map(([a, b]) => [a.pos, b.pos] as const);
		}).flatMap(([a, b]) => line(a, b));

		this.setAttribute2f(gl, "aPosition", pos);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
export abstract class MovingNodeWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert: circleVert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Omit<MovingData, "size">[];

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
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const objs = this.rects(viewportInfo, webGlViewportInfo);
		const nodes = objs.flatMap(obj => {
			const { period, points } = obj;
			const valid = points
				.filter(p => p.time >= 0 && p.time <= period);
			return valid.map(p => p.pos);
		}).map(pos => circleBounds(pos, 1));
		const pos = nodes.flatMap(rect);
		const uvs = nodes.flatMap(() => unitSquareUvs);

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute2f(gl, "aUv", uvs);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}

const rgba = Color.hex(0x000000).rgba();

export class AllMovingTrackWebGLRenderer extends MovingTrackWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Omit<MovingData, "size">[] {
		return viewportInfo.room.objects.values()
			.filter(o => o.type === "movingObstacle"
				|| o.type === "movingLava"
				|| o.type === "movingSlime"
				|| o.type === "movingIce"
			)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}
export class AllMovingNodeWebGLRenderer extends MovingNodeWebGLRenderer {
	constructor() {
		super(circleFrag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Omit<MovingData, "size">[] {
		return viewportInfo.room.objects.values()
			.filter(o => o.type === "movingObstacle"
				|| o.type === "movingLava"
				|| o.type === "movingSlime"
				|| o.type === "movingIce"
			)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}