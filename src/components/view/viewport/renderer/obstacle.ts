import { quad, WebGlRenderer } from "../webgl/webgl.ts";
import vert from "./shader/default.vert?raw";
import frag from "./shader/obstacle.frag?raw";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { SkapObstacle } from "../../../../editor/map.ts";

export class ObstacleWebGLRenderer extends WebGLLayerRenderer {
	constructor() {
		super({
			vert,
			frag,
		});
	}
	render(viewportInfo: ViewportInfo, {
		cameraSize,
	}: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);

		const camera = viewportInfo.camera;
		this.setUniformFloat2(gl, "uCameraPosition", camera.pos);
		this.setUniformFloat2(gl, "uCameraSize", cameraSize);
		// console.log(cameraSize.toText().lines.join("\n"));
		this.setUniform(gl, WebGlRenderer.TYPES.vec4, "uObstacleColor",
			0x00 / 0xff,
			0x0a / 0xff,
			0x57 / 0xff,
			0.8
		);

		const obstacles = viewportInfo.map.objects.filter((obj): obj is SkapObstacle => obj.type === "obstacle");
		const pos = obstacles.flatMap(obs => quad(obs.bounds));

		const posBuffer = this.setBuffer(gl, "aPosition", gl.ARRAY_BUFFER, new Float32Array(pos).buffer, gl.DYNAMIC_DRAW);
		this.setAttribute(gl, gl.ARRAY_BUFFER, "aPosition", WebGlRenderer.TYPES.vec2, posBuffer);

		gl.drawArrays(gl.TRIANGLES, 0, obstacles.length * 6);
	}
}