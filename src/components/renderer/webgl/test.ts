import { WebGLLayer } from "./webgl.ts";
import vert from "./default.vert.glsl?raw";
import frag from "./default.frag.glsl?raw";
import { ViewportBounds } from "../layer.ts";

export class TestWebGLRenderer extends WebGLLayer<number> {
	constructor(zIndex: number) {
		super(zIndex, {
			vert,
			frag,
		});
	}
	canRender(thing: unknown): thing is number {
		return typeof thing === "number";
	}
	render(viewport: ViewportBounds, things: number[]): void {
		this.setup(viewport);
		const gl = this.gl;

		gl.useProgram(this.program);

		this.setUniform(gl, WebGLLayer.TYPES.vec2, "uCameraPosition",
			viewport.x, viewport.y
		);		
		this.setUniform(gl, WebGLLayer.TYPES.vec2, "uCameraSize",
			viewport.width / viewport.scale,
			-viewport.height / viewport.scale
		);

		const pos = this.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
			-10, -10,
			+10, -10,
			+10, +10,
			-10, -10,
			+10, +10,
			-10, +10,
			-10, -10,
		]), gl.DYNAMIC_DRAW);

		this.setAttribute(gl, gl.ARRAY_BUFFER, "aPosition", WebGLLayer.TYPES.vec2, pos);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}