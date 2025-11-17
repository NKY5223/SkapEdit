import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import fragObs from "./shader/obstacle.frag?raw";
import fragBG from "./shader/solidColor.frag?raw";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";

export class BackgroundObstacleWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(fragObs);
	}
	rects(_: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Bounds[] {
		return [
			webGlViewportInfo.canvasBounds
		];
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo): void {
		this.setUniform4f(gl, "uColor", viewportInfo.room.obstacleColor.rgba());
		this.setUniform1f(gl, "uOpacity", 1);
	}
}
export class BackgroundWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(fragBG);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return [
			viewportInfo.room.bounds
		];
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo): void {
		this.setUniform4f(gl, "uColor", viewportInfo.room.backgroundColor.rgba());
	}
}