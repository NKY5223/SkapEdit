import { useState } from "react";
import { Realize } from "../../../common/types.ts";
import { Bounds } from "../../../editor/bounds.ts";
import { Vec2, vec2 } from "../../../common/vec2.ts";

export type InitCamera = ({
	x: number;
	y: number;
	scale: number;
} | {
	pos: Vec2;
	scale: number;
});
export type UpdateCamera = Realize<({} | {
	pos: Vec2;
} | {
	x: number;
	y: number;
}) & ({} | {
	scale: number;
})>;

export type SetCamera = UpdateCamera | ((camera: Camera) => UpdateCamera);
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
	set(update: SetCamera): Camera {
		if (typeof update === "function") {
			return this.set(update(this));
		}
		const scale = "scale" in update ? update.scale : this.scale;
		const pos = "pos" in update ? update.pos :
			"x" in update ? vec2(update.x, update.y) :
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

	get x(): number { return this.pos[0]; }
	get y(): number { return this.pos[1]; }
}

export const useCamera = (initial: InitCamera): [
	camera: Camera,
	setCamera: (camera: SetCamera) => void
] => {
	const [camera, setCamera] = useState<Camera>(new Camera(initial));
	return [
		camera,
		camera => setCamera(c => c.set(camera))
	];
};
