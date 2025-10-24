import { Vec2 } from "@common/vec2.ts";
import { SkapObject } from "@editor/map.ts";

const zIndexMap = new Map<SkapObject["type"], number>([
	["obstacle", 0],
	["lava", 5],
	["text", 10],
]);
export const zIndex = (obj: SkapObject): number => zIndexMap.get(obj.type) ?? -Infinity;
export const clickbox = (obj: SkapObject, clickPos: Vec2): boolean => {
	switch (obj.type) {
		case "obstacle":
		case "lava": {
			return obj.bounds.contains(clickPos);
		}
		case "text": {
			return obj.pos.sub(clickPos).mag() <= 5;
		}
	}
};
