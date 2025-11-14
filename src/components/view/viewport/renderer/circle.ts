import { Vec2 } from "@common/vec2.ts";
import { circleBounds } from "@editor/object/circular.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/texture.vert?raw";
import { unitSquareUvs } from "./spawner.ts";

export abstract class CircleWebGLRenderer extends WebGLLayerRenderer {
	constructor(frag: string) {
		super({
			vert,
			frag,
		});
	}
	abstract circles(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): {
		pos: Vec2;
		radius: number;
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

		const circles = this.circles(viewportInfo, webGlViewportInfo);
		const pos = circles.flatMap(r => rect(circleBounds(r.pos, r.radius)));
		const uvs = circles.flatMap(() => unitSquareUvs);

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute2f(gl, "aUv", uvs);

		this.preRender(gl, viewportInfo, webGlViewportInfo);

		gl.drawArrays(gl.TRIANGLES, 0, circles.length * 6);

		this.postRender(gl, viewportInfo, webGlViewportInfo);
	}
}
