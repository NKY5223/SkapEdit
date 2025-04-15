import frag from "./shader/obstacle.frag?raw";
import { RectWebGLRenderer } from "./rect.ts";
import { Bounds } from "../../../../editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { SkapObstacle } from "../../../../editor/map.ts";
import { WebGlRenderer } from "../webgl/webgl.ts";

export class ObstacleWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.map.objects
			.filter((obj): obj is SkapObstacle => obj.type === "obstacle")
			.map(o => o.bounds);
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform(gl, WebGlRenderer.TYPES.vec4, "uObstacleColor",
			0x00 / 0xff,
			0x0a / 0xff,
			0x57 / 0xff,
			0.8
		);
	}
}