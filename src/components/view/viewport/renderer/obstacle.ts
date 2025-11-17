import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { CircleWebGLRenderer } from "./circle.ts";
import { MovingRectWebGLRenderer } from "./moving.ts";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/obstacle.frag?raw";
import circleFrag from "./shader/obstacleCircle.frag?raw";
import { centeredBounds } from "@editor/object/moving.tsx";

export class ObstacleWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "obstacle" ||
				obj.type === "movingObstacle")
			.map(o => "bounds" in o
				? o.bounds
				: centeredBounds(o.points[0].pos, o.size))
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo): void {
		const rgba = viewportInfo.room.obstacleColor.rgba();
		this.setUniform4f(gl, "uColor", rgba);
		this.setUniform1f(gl, "uOpacity", 1);
	}
}
export class CircularObstacleWebGLRenderer extends CircleWebGLRenderer {
	constructor() {
		super(circleFrag);
	}
	circles(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "circularObstacle")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const rgba = viewportInfo.room.obstacleColor.rgba();
		this.setUniform4f(gl, "uColor", rgba);
	}
}
export class MovingObstacleWebGLRenderer extends MovingRectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "movingObstacle")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const rgba = viewportInfo.room.obstacleColor.rgba();
		this.enableDefaultBlend(gl);
		this.setUniform4f(gl, "uColor", rgba);
		this.setUniform1f(gl, "uOpacity", .25);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.disableBlend(gl);
	}
}