import { SkapObject } from "@editor/map.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import vert from "./shader/color.vert?raw";
import frag from "./shader/color.frag?raw";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { Vector } from "@common/vector.ts";
import { SkapBlock } from "@editor/object/block.ts";

export class BlockWebGLRenderer extends WebGLLayerRenderer {
	constructor(readonly layer: SkapBlock["layer"]) {
		super({ vert, frag });
	}
	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);
		this.enableDefaultBlend(gl);

		const {
			cameraSize,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const blocks = viewportInfo.room.objects.values()
			.filter(obj => obj.type === "block")
			.filter(obj => obj.layer === this.layer)
			.toArray();
		const colors = blocks.flatMap(block =>
			// 6 entries, 1 per vertex
			new Array<Vector<4>>(6).fill(block.color.rgba())
		);
		const pos = blocks.flatMap(block => rect(block.bounds));

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute4f(gl, "aColor", colors);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		// disable it, don't need it until drawing blocks again
		this.disableBlend(gl);
	}
}