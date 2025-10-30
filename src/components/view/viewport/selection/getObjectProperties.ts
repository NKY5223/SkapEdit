import { vec2, Vec2 } from "@common/vec2.ts";
import { SelectableItem } from "@components/editor/selection.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapObject } from "@editor/map.ts";
import { getProperties } from "@editor/object/Properties.ts";

export const getZIndex = (
	item: SelectableItem,
): number => {
	switch (item.type) {
		case "object": {
			return getProperties(item.object).selection.zIndex(item.object);
		}
		case "room": {
			return -Infinity;
		}
	}
};
export const getClickbox = (
	item: SelectableItem, pos: Vec2,
): boolean => {
	switch (item.type) {
		case "object": {
			return getProperties(item.object).selection.clickbox(item.object, pos);
		}
		case "room": {
			return item.room.bounds.contains(pos);
		}
	}
};
export const getAffine = <O extends SkapObject>(
	object: O
) => {
	return getProperties(object).transform.affine;
};
export const getTranslate = <O extends SkapObject>(
	object: O
) => {
	const affine = getAffine(object);
	return (object: O, translate: Vec2) => affine(object, vec2(1), translate);
};
export const getSelectableBounds = (
	item: SelectableItem
): Bounds => {
	switch (item.type) {
		case "object": {
			return getProperties(item.object).bounds(item.object);
		}
		case "room": {
			return item.room.bounds;
		}
	}
}