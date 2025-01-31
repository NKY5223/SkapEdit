import { WebGLLayer } from "./webgl.ts";
import vert from "./shader/obstacle.vert?raw";
import frag from "./shader/obstacle.frag?raw";
import { ViewportBounds } from "../layer.ts";

export type Bounds = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

type TestRenderable = Bounds;

function quad(bounds: Bounds): number[] {
	const { left: l, top: t, right: r, bottom: b } = bounds;
	return [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 0],
		[1, 1],
		[0, 1],
	].flatMap(([x, y]) => [x ? r : l, y ? b : t]);
}

export class TestWebGLRenderer extends WebGLLayer<TestRenderable> {
	constructor(zIndex: number) {
		super(zIndex, {
			vert,
			frag,
		});
	}
	canRender(thing: unknown): thing is TestRenderable {
		return (
			typeof thing === "object" &&
			!!thing &&
			"left" in thing && typeof thing.left === "number" &&
			"top" in thing && typeof thing.top === "number" &&
			"right" in thing && typeof thing.right === "number" &&
			"bottom" in thing && typeof thing.bottom === "number"
		);
	}
	render(viewport: ViewportBounds, things: TestRenderable[]): void {
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
		this.setUniform(gl, WebGLLayer.TYPES.vec4, "uObstacleColor",
			0x00/0xff,
			0x0a/0xff,
			0x57/0xff,
			0.8
		);

		const pos = things.flatMap(bounds => quad(bounds));
		// debugger;
		const posBuffer = this.setBuffer(gl, "aPosition", gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
		this.setAttribute(gl, gl.ARRAY_BUFFER, "aPosition", WebGLLayer.TYPES.vec2, posBuffer);

		gl.drawArrays(gl.TRIANGLES, 0, things.length * 6);
	}
}