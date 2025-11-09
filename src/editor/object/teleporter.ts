import { ID } from "@common/uuid.ts";
import { Bounds } from "@editor/bounds.ts";
import { BaseObject, makeObjectProperties } from "@editor/object/Base";
import { CardinalDirection } from "./Base.ts";

export type SkapTeleporter = BaseObject<"teleporter", {
	bounds: Bounds;
	target: {
		type: "room";
		roomId: ID;
	} | {
		type: "teleporter";
		teleporterId: ID;
	};
	direction: CardinalDirection;
}>;

export const teleporterProperties = makeObjectProperties<SkapTeleporter>("teleporter", {
	bounds: obj => obj.bounds,
	selection: {
		zIndex: () => 10,
		clickbox: (obj, pos) => obj.bounds.contains(pos),
	},
	transform: {
		affine: (obj, scale, translate) => ({
			...obj,
			bounds: obj.bounds.affine(scale, translate)
		}),
	},
});