import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/obstacle.frag?raw";

export class ObstacleWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "obstacle")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo): void {
		this.setUniform4f(gl, "uColor", viewportInfo.room.obstacleColor.rgba());
	}
}