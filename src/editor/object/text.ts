import { Vec2 } from "@common/vec2.ts";
import { makeObjectProperties } from "@editor/map.ts";
import { BaseObject } from "@editor/object/Base";

export type SkapText = BaseObject<"text", {
	pos: Vec2;
	text: string;
}>;
export const textProperties = makeObjectProperties("text", {
	zIndex: () => 10,
	clickbox: (obj: SkapText, pos) => obj.pos.sub(pos).mag() <= 5,
});