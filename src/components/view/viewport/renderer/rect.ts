import { Bounds } from "../../../../editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGlRenderer, rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/default.vert?raw";

export abstract class RectWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract rects(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): Bounds[];

	preRender(gl: WebGL2RenderingContext, viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		// satisfy "no unused variables"
		gl;
		viewportInfo;
		webGlViewportInfo;
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

		const boundses = this.rects(viewportInfo, webGlViewportInfo);
		const pos = boundses.flatMap(bounds => rect(bounds));

		this.setAttribute2f(gl, "aPosition", pos);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, boundses.length * 6);
	}
}
