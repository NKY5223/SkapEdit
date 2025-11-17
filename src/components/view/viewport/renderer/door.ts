import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solidColor.frag?raw";

const bg = Color.DOOR_BACKGROUND.rgba();

export class DoorWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "door")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		// this.enableDefaultBlend(gl);
		this.setUniform4f(gl, "uColor", bg);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		// this.disableBlend(gl);
	}
}