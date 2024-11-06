import { WebGLLayer } from "./webgl.ts";
import vert from "./default.vert.glsl?raw";
import frag from "./default.frag.glsl?raw";

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
	render(things: number[]): void {
		this.draw();
	}
	draw(): void {
		super.draw();
		const gl = this.gl;

		gl.useProgram(this.program);

		gl.uniform2f(gl.getUniformLocation(this.program, "uCameraPosition"), 0, 0);
		gl.uniform2f(gl.getUniformLocation(this.program, "uCameraSize"), 600, -600);

		const pos = this.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array([
			-10, -10,
			+10, -10,
			+10, +10,
			-10, -10,
			+10, +10,
			-10, +10,
			-10, -10,
		]), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, pos);
		gl.vertexAttribPointer(gl.getAttribLocation(this.program, "aPosition"), 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(gl.getAttribLocation(this.program, "aPosition"));

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}