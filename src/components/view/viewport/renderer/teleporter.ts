import { Vec2 } from "@common/vec2.ts";
import { SkapTeleporter } from "@editor/object/teleporter.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import frag from "./shader/teleporter.frag?raw";
import vert from "./shader/teleporter.vert?raw";
import { CardinalDirection } from "@editor/object/Base.tsx";

const getGrads = (tp: SkapTeleporter): number[] => {
	// vertex order
	// 	topLeft,
	// 	topRight,
	// 	bottomRight,
	// 	topLeft,
	// 	bottomLeft,
	// 	bottomRight,
	switch (tp.direction) {
		case CardinalDirection.Down:
			return [0, 0, 1, 0, 1, 1];
		case CardinalDirection.Left:
			return [1, 0, 0, 1, 1, 0];
		case CardinalDirection.Up:
			return [1, 1, 0, 1, 0, 0];
		case CardinalDirection.Right:
			return [0, 1, 1, 0, 0, 1];
	}
}

export class TeleporterWebGLRenderer extends WebGLLayerRenderer {
	constructor() {
		super({ vert, frag });
	}
	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo) {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const {
			room,
		} = viewportInfo;
		const {
			cameraSize,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);
		this.setUniform4f(gl, "uObstacleColor", room.obstacleColor.rgba());
		this.setUniform4f(gl, "uBackgroundColor", room.backgroundColor.rgba());

		const tps = viewportInfo.room.objects.values().filter(obj => obj.type === "teleporter").toArray();
		const pos = tps.flatMap(tp => rect(tp.bounds));
		const grads = tps.flatMap(getGrads);

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute1f(gl, "aGrad", grads);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		gl.disable(gl.BLEND);
	}
}