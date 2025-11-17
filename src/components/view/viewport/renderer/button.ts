import { Color } from "@common/color.ts";
import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { RectWebGLRenderer } from "./rect.ts";
import frag from "./shader/solidColor.frag?raw";
import { TransformedRectWebGLRenderer } from "./transformed.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { vec2 } from "@common/vec2.ts";

const bg = Color.BUTTON.rgba();
const bevel = 0.1;

export class ButtonWebGLRenderer extends TransformedRectWebGLRenderer {
	constructor() {
		super(frag, new Map([
			[CardinalDirection.Down, [
				vec2(bevel, 0),
				vec2(1 - bevel, 0),
				vec2(0, 1),
				vec2(1, 1),
			]],
			[CardinalDirection.Left, [
				vec2(0, 0),
				vec2(1, bevel),
				vec2(0, 1),
				vec2(1, 1 - bevel),
			]],
			[CardinalDirection.Up, [
				vec2(0, 0),
				vec2(1, 0),
				vec2(bevel, 1),
				vec2(1 - bevel, 1),
			]],
			[CardinalDirection.Right, [
				vec2(0, bevel),
				vec2(1, 0),
				vec2(0, 1 - bevel),
				vec2(1, 1),
			]],
		]));
	}
	rects(viewportInfo: ViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "button")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", bg);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}
}