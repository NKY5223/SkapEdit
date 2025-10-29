import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solid.frag?raw";
import { SkapLava } from "@editor/object/lava.ts";

export class LavaWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "lava")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", Color.hex(0xb74038).rgba());
	}
}