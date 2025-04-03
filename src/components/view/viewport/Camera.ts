import { useState } from "react";
import { Realize } from "../../../common/types.ts";
import { Bounds } from "../../editor/bounds.ts";
import { Vec2, vec2 } from "../../../common/vec2.ts";

type InitCamera = ({
	x: number;
	y: number;
	scale: number;
} | {
	pos: Vec2;
	scale: number;
});
type UpdateCamera = Realize<({
	pos: Vec2;
} | {
	x: number;
	y: number;
}) & ({} | {
	scale: number;
})>;
export class Camera {
	readonly pos: Vec2;
	readonly scale: number;
	constructor(camera: InitCamera) {
		this.scale = camera.scale;
		if ("pos" in camera) {
			this.pos = camera.pos;
		} else {
			this.pos = vec2(camera.x, camera.y);
		}
	}
	set(camera: UpdateCamera) {
		const scale = "scale" in camera ? camera.scale : this.scale;
		const pos = "pos" in camera ? camera.pos :
			"x" in camera ? vec2(camera.x, camera.y) :
				this.pos;
		return new Camera({
			pos, scale,
		});
	}
	getBounds(viewportSize: Vec2): Bounds {
		const halfSize = viewportSize.div(this.scale, 2);
		const topLeft = this.pos.sub(halfSize);
		const bottomRight = this.pos.add(halfSize);
		return new Bounds({
			topLeft,
			bottomRight,
		});
	}
}
;
export const useCamera = (initial: InitCamera): [
	camera: Camera,
	setCamera: (camera: UpdateCamera) => void
] => {
	const [camera, setCamera] = useState<Camera>(new Camera(initial));
	return [
		camera,
		(camera) => setCamera(c => c.set(camera))
	];
};
