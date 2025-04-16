import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapLava } from "@editor/map.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solid.frag?raw";

export class LavaWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects
			.filter((obj): obj is SkapLava => obj.type === "lava")
			.map(o => o.bounds);
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", Color.hex(0xb74038).rgba());
	}
}