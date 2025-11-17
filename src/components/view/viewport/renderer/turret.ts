import { Color } from "@common/color.ts";
import { Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { CircleWebGLRenderer } from "./circle.ts";
import { RectWebGLRenderer } from "./rect.ts";
import { RotatedRectWebGLRenderer } from "./rotated.ts";
import frag from "./shader/solidColor.frag?raw";
import circleFrag from "./shader/solidColorCircle.frag?raw";
import { MovingRectWebGLRenderer } from "./moving.ts";
import { centeredBounds } from "@editor/object/moving.tsx";

const rgba = Color.TURRET.rgba();

export class TurretWebGLRenderer extends CircleWebGLRenderer {
	constructor() {
		super(circleFrag);
	}
	circles(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "turret")
			.map(obj => ({
				pos: obj.pos,
				radius: 3,
			}))
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}