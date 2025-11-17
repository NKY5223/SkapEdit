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

const rgba = Color.ICE.rgba();
const ghost = Color.ICE.withAlpha(0.25).rgba();

export class IceWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "ice" ||
				obj.type === "movingIce")
			.map(o => "bounds" in o
				? o.bounds
				: centeredBounds(o.points[0].pos, o.size))
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}

export class CircularIceWebGLRenderer extends CircleWebGLRenderer {
	constructor() {
		super(circleFrag);
	}
	circles(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "circularIce")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}
export class MovingIceWebGLRenderer extends MovingRectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "movingIce")
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