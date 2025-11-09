import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solidColor.frag?raw";

const rgba = Color.ICE.rgba();

export class IceWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "ice")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}