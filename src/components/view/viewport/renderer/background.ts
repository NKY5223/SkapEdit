import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import fragObs from "./shader/obstacle.frag?raw";
import fragBG from "./shader/solid.frag?raw";
import { Color } from "@common/color.ts";

export class BackgroundObstacleWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(fragObs);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return [
			viewportInfo.viewportBounds
		];
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo): void {
		this.setUniform4f(gl, "uColor", viewportInfo.room.obstacleColor.rgba());
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