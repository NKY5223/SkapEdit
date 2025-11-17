import { Color } from "@common/color.ts";
import { vec2 } from "@common/vec2.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import frag from "./shader/solidColor.frag?raw";
import { TransformedRectWebGLRenderer } from "./transformed.ts";

const bg = Color.BUTTON.rgba();
const bevel = 0.2;

export class SwitchWebGLRenderer extends TransformedRectWebGLRenderer {
	constructor() {
		super(frag, new Map([
			[CardinalDirection.Down, [
				vec2(0, 0),
				vec2(1, -bevel),
				vec2(0, 1),
				vec2(1, 1),
			]],
			[CardinalDirection.Left, [
				vec2(0, 0),
				vec2(1, 0),
				vec2(0, 1),
				vec2(1 + bevel, 1),
			]],
			[CardinalDirection.Up, [
				vec2(0, 0),
				vec2(1, 0),
				vec2(0, 1 + bevel),
				vec2(1, 1),
			]],
			[CardinalDirection.Right, [
				vec2(-bevel, 0),
				vec2(1, 0),
				vec2(0, 1),
				vec2(1, 1),
			]],
		]));
	}
	rects(viewportInfo: ViewportInfo) {
		return viewportInfo.room.objects.values()
			.filter(obj => obj.type === "switch")
			.toArray();
	}
	preRender(gl: WebGL2RenderingContext): void {
		this.setUniform4f(gl, "uColor", bg);
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}
}