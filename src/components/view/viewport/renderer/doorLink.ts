import { Color } from "@common/color.ts";
import { ViewportInfo } from "../Viewport.tsx";
import { WebGLLayerRenderer, WebGLViewportInfo } from "../webgl/WebGLLayer.tsx";
import { line } from "./movingTrack.ts";
import frag from "./shader/color.frag?raw";
import vert from "./shader/color.vert?raw";
import { Vector } from "@common/vector.ts";

const LinkRgba = Color.DOORLINK.rgba();
const InvertRgba = Color.DOORLINK_ACTIVE.rgba();
const HiddenRgba = Color.DOORLINK_HIDDEN.rgba();
const InvertHiddenRgba = Color.DOORLINK_ACTIVE_HIDDEN.rgba();

export class DoorLinkWebGLRenderer extends WebGLLayerRenderer {
	constructor() {
		super({ vert, frag });
	}
	render(viewportInfo: ViewportInfo, webGlViewportInfo: WebGLViewportInfo): void {
		const info = this.info;
		if (!info) return;
		const { gl, program } = info;

		gl.useProgram(program);

		const {
			cameraSize,
		} = webGlViewportInfo;
		const {
			camera,
			room,
		} = viewportInfo;

		this.setUniform2f(gl, "uCameraPosition", camera.pos);
		this.setUniform2f(gl, "uCameraSize", cameraSize);

		const links = room.objects.values()
			.filter(v => v.type === "door")
			.flatMap(door => door.connections.map((connection) => {
				const { objectId } = connection;
				const input = room.objects.get(objectId);
				if (!input) return null;
				if (input.type !== "button"/*  && input.type !== "switch" */) return null;
				return [door, input, connection] as const;
			}))
			.filter(v => v !== null)
			.toArray();

		const pos = links.flatMap(([door, button]) =>
			line(door.bounds.center(), button.bounds.center(), 1)
		);
		const colors = links.map(([, , connection]) => {
			const { hidden, invert } = connection;
			if (hidden) {
				if (invert) return InvertHiddenRgba;
				return HiddenRgba;
			}
			if (invert) return InvertHiddenRgba;
			return LinkRgba;
		}).flatMap(v => new Array<typeof v>(6).fill(v));

		this.setAttribute2f(gl, "aPosition", pos);
		this.setAttribute4f(gl, "aColor", colors);

		gl.drawArrays(gl.TRIANGLES, 0, pos.length);

	}
}