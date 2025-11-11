import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solidColor.frag?raw";
import { RotatedRectWebGLRenderer } from "./rotated.ts";
import { Vec2 } from "@common/vec2.ts";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { Vector } from "@common/vector.ts";

const rgba = Color.LAVA.rgba();
const ghost = Color.LAVA.withAlpha(0.5).rgba();

export class LavaWebGLRenderer extends RectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo): Bounds[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "lava" || obj.type === "rotatingLava")
			.map(o => o.bounds)
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", rgba);
	}
}

export class RotatingLavaWebGLRenderer extends RotatedRectWebGLRenderer {
	constructor() {
		super(frag);
	}
	rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): { bounds: Bounds; center: Vec2; rotation: number; }[] {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "rotatingLava")
			.map(o => ({
				bounds: o.bounds,
				center: o.rotation.center,
				rotation: o.rotation.initial + webGlViewportInfo.time * o.rotation.speed,
			}))
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.enableDefaultBlend(gl);
		this.setUniform4f(gl, "uColor", ghost);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		this.disableBlend(gl);
	}
}