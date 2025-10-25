import { Vec2 } from "@common/vec2.ts";
import { SkapObject, SkapRoom } from "@editor/map.ts";

const zIndexMap = new Map<SkapObject["type"], number>([
	["obstacle", 0],
	["lava", 5],
	["text", 10],
]);
export const zIndex = (obj: SkapObject | SkapRoom): number => 
	"type" in obj ? zIndexMap.get(obj.type) ?? -Infinity : -Infinity;
export const clickbox = (obj: SkapObject | SkapRoom, clickPos: Vec2): boolean => {
	if (!("type" in obj)) {
		return obj.bounds.contains(clickPos);
	}
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
