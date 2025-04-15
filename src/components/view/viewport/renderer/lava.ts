import frag from "./shader/lava.frag?raw";
import { RectWebGLRenderer } from "./rect.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapLava } from "@editor/map.ts";
import { ViewportInfo } from "../Viewport.tsx";

export class LavaWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.map.objects
			.filter((obj): obj is SkapLava => obj.type === "lava")
			.map(o => o.bounds);
	}
}