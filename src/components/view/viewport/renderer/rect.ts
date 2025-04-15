import { Bounds } from "../../../../editor/bounds.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGlRenderer, quad } from "../webgl/webgl.ts";
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
		// Stop ts screaming at me
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
		this.setUniformFloat2(gl, "uCameraPosition", camera.pos);
		this.setUniformFloat2(gl, "uCameraSize", cameraSize);

		const boundses = this.rects(viewportInfo, webGlViewportInfo);
		const pos = boundses.flatMap(bounds => quad(bounds));

		const posBuffer = this.setBuffer(gl, "aPosition", gl.ARRAY_BUFFER, new Float32Array(pos).buffer, gl.DYNAMIC_DRAW);
		this.setAttribute(gl, gl.ARRAY_BUFFER, "aPosition", WebGlRenderer.TYPES.vec2, posBuffer);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, boundses.length * 6);
	}
}
