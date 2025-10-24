import { vec2, Vec2 } from "@common/vec2.ts";

export function vec2Setters(set: React.Dispatch<React.SetStateAction<Vec2>>) {
	return {
		setX: (x: number) => set(b => vec2(x, b[1])),
		setY: (y: number) => set(b => vec2(b[0], y)),
	};
}
