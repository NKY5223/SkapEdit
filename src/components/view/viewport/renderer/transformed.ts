import { Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/default.vert?raw";

export abstract class TransformedRectWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string, readonly transforms: Map<CardinalDirection, [
		topLeft: Vec2,
		topRight: Vec2,
		bottomLeft: Vec2,
		bottomRight: Vec2,
	]>) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): {
		bounds: Bounds;
		dir: CardinalDirection;
	}[];

	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}
	postRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
	}

	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);

		const {
			cameraSize,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const rects = this.rects(viewportInfo, webGlViewportInfo);
		const pos = rects.flatMap(r => {
			const trans = this.transforms.get(r.dir);
			if (!trans) throw new Error("No transform for transformedrect");
			const [topLeft, topRight, bottomLeft, bottomRight] = trans.map(t => r.bounds.lerp(t));
			return [
				topLeft,
				topRight,
				bottomRight,
				topLeft,
				bottomLeft,
				bottomRight,
			];
		});

		this.setAttribute2f(gl, "aPosition", pos);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
