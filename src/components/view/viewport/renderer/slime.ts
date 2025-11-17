import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { centeredBounds } from "@editor/object/moving.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { CircleWebGLRenderer } from "./circle.ts";
import { MovingRectWebGLRenderer } from "./moving.ts";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solidColor.frag?raw";
import circleFrag from "./shader/solidColorCircle.frag?raw";

const rgba = Color.SLIME.rgba();
const ghost = Color.SLIME.withAlpha(0.25).rgba();

export class SlimeWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "slime" ||
				obj.type === "movingSlime")
			.map(o => "bounds" in o
				? o.bounds
				: centeredBounds(o.points[0].pos, o.size))
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}

export class CircularSlimeWebGLRenderer extends CircleWebGLRenderer {
	constructor() {
		super(circleFrag);
	}
	circles(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "circularSlime")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}
export class MovingSlimeWebGLRenderer extends MovingRectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "movingSlime")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.enableDefaultBlend(gl);
		this.setUniform4f(gl, "uColor", ghost);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.disableBlend(gl);
	}
}