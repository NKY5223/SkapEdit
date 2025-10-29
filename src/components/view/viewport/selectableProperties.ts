import { Vec2 } from "@common/vec2.ts";
import { SelectableItem } from "@components/editor/selection.ts";
import { SkapObject } from "@editor/map.ts";
import { getProperties } from "@editor/object/Properties.ts";

export const getZIndex = (
	sel: SelectableItem,
): number => {
	switch (sel.type) {
		case "object": {
			return getProperties(sel.object).zIndex(sel.object);
		}
		case "room": {
			return -Infinity;
		}
	}
};
export const getClickbox = (
	sel: SelectableItem, pos: Vec2,
): boolean => {
	switch (sel.type) {
		case "object": {
			return getProperties(sel.object).clickbox(sel.object, pos);
		}
		case "room": {
			return sel.room.bounds.contains(pos);
		}
	}
};
