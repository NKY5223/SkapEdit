import { Vec2 } from "@common/vec2.ts";
import { ViewportInfo } from "./Viewport.tsx";

/**
 * Converts a `Vec2` from viewport space to map space.
 * Is the inverse of `mapToViewport`.
 *
 * E.g. with `500x500` viewport, camera at `⟨10, 0⟩ ×5`:
 * ```ts
 * viewportToMap(info, vec2(250, 250)) ⇒ ⟨10, 0⟩;
 * viewportToMap(info, vec2(300, 325)) ⇒ ⟨20, 15⟩;
 */

export const viewportToMap = (info: ViewportInfo, pos: Vec2): Vec2 => {
	const { camera, viewportSize } = info;
	return pos.sub(viewportSize.div(2)).div(camera.scale).add(camera.pos);
};
/**
 * Converts a `Vec2` from map space to viewport space.
 * Is the inverse of `viewportToMap`.
 *
 * E.g. with `500x500` viewport, camera at `⟨10, 0⟩ ×5`:
 * ```ts
 * mapToViewport(info, vec2(0, 0)) ⇒ ⟨200, 250⟩;
 * mapToViewport(info, vec2(10, 15)) ⇒ ⟨250, 325⟩;
 * ```
 */
export const mapToViewport = (info: ViewportInfo, pos: Vec2): Vec2 => {
	const { camera, viewportSize } = info;
	return viewportSize.div(2).add(pos.sub(camera.pos).mul(camera.scale));
};
export const mapToViewportCenter = (info: ViewportInfo, pos: Vec2): Vec2 => {
	const { camera } = info;
	return pos.sub(camera.pos).mul(camera.scale);
};