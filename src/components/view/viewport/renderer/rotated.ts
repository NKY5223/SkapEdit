import { Bounds } from "@editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/rotated.vert?raw";
import { Vec2 } from "@common/vec2.ts";

export abstract class RotatedRectWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): {
		bounds: Bounds;
		center: Vec2;
		rotation: number;
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
		const pos = rects.flatMap(r => rect(r.bounds));
		const centers = rects.flatMap(r => 
			new Array<Vec2>(6).fill(r.center)
		);
		const rotations = rects.flatMap(r => 
			new Array<number>(6).fill(r.rotation / 180 * Math.PI)
		);

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute2f(gl, "aCenter", centers);
		this.setAttribute1f(gl, "aRotation", rotations);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, rects.length * 6);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
