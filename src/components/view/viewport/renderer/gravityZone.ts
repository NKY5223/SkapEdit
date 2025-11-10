import { Color } from "@common/color.ts";
import { Vector } from "@common/vector.ts";
import { SkapGravityZone } from "@editor/object/gravityZone.ts";
import { CardinalDirection } from "@editor/object/Base.tsx";
import { ViewportInfo } from "../Viewport.tsx";
import { rect } from "../webgl/webgl.ts";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import frag from "./shader/gravityZone.frag?raw";
import vert from "./shader/gravityZone.vert?raw";

const getColor = (zone: SkapGravityZone): [fg: Color, bg: Color] => {
	const { direction } = zone;
	if (direction.type === "free") return [Color.GRAVITYZONE_FG_FREE, Color.GRAVITYZONE_BG_FREE];
	switch (direction.direction) {
		case CardinalDirection.Up: return [Color.GRAVITYZONE_FG_UP, Color.GRAVITYZONE_BG_UP];
		case CardinalDirection.Left: return [Color.GRAVITYZONE_FG_LEFT, Color.GRAVITYZONE_BG_LEFT];
		case CardinalDirection.Down: return [Color.GRAVITYZONE_FG_DOWN, Color.GRAVITYZONE_BG_DOWN];
		case CardinalDirection.Right: return [Color.GRAVITYZONE_FG_RIGHT, Color.GRAVITYZONE_BG_RIGHT];
	}
}
// Returns angle of the zone.
// 0 = down,
// π/2 = left,
// π = up,
// etc.
const getDirection = (zone: SkapGravityZone): number => {
	if (zone.direction.type === "cardinal") {
		return Math.PI * zone.direction.direction / 2;
	}
	// deg to rad
	return Math.PI * zone.direction.direction / 180;
}
const getSpeed = (zone: SkapGravityZone): number => {
	if (zone.direction.type === "cardinal") { return 1; }
	return 0;
}

export class GravityZoneWebGLRenderer extends WebGLLayerRenderer {
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
			timeOrigin,
		} = viewportInfo;
		const {
			cameraSize,
		} = webGlViewportInfo;

		const camera = viewportInfo.camera;
		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		this.setUniform1f(gl, "uTime", (performance.now() - timeOrigin) / 1000);

		const zones = viewportInfo.room.objects.values().filter(obj => obj.type === "gravityZone").toArray();
		const fgColors = zones.flatMap(block =>
			// 6 entries, 1 per vertex
			new Array<Vector<4>>(6).fill(getColor(block)[0].rgba())
		);
		const bgColors = zones.flatMap(block =>
			// 6 entries, 1 per vertex
			new Array<Vector<4>>(6).fill(getColor(block)[1].rgba())
		);
		const pos = zones.flatMap(block => rect(block.bounds));
		const dirs = zones.flatMap(block =>
			// 6 entries, 1 per vertex
			new Array<number>(6).fill(getDirection(block))
		);
		const speeds = zones.flatMap(block =>
			// 6 entries, 1 per vertex
			new Array<number>(6).fill(getSpeed(block))
		);

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute4f(gl, "aFgColor", fgColors);
		this.setAttribute4f(gl, "aBgColor", bgColors);
		this.setAttribute1f(gl, "aDirection", dirs);
		this.setAttribute1f(gl, "aArrowSpeed", speeds);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

		gl.disable(gl.BLEND);
	}
}