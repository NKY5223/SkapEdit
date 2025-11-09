import { Color } from "@common/color.ts";
import { createId, ID } from "@common/uuid.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapMap, SkapObject, SkapRoom, toIdMap } from "@editor/map.ts";
import { SkapFile } from "./skap.ts";
import { SkapTeleporter } from "@editor/object/teleporter.ts";
import { CardinalDirection } from "@editor/object/Base.ts";

const skapToVec2 = (v: SkapFile.Vec2): Vec2 => vec2(...v);
const skapToRgb = (c: SkapFile.Rgb): Color => Color.rgb255(...c);
const skapToRgba = (c: SkapFile.Rgba): Color => Color.rgb255(...c);
const skapToBounds = (pos: SkapFile.Vec2, size: SkapFile.Vec2): Bounds => new Bounds({ pos: skapToVec2(pos), size: skapToVec2(size) });

type P<T> =
	T extends SkapTeleporter ? {
		type: "teleporter";
		bounds: Bounds;
		id: ID;
		direction: CardinalDirection;
		skapId: SkapFile.Id;
		targetRoom: string;
		targetSkapId: SkapFile.Id;
	} :
	T;
type PartialSkapObject = P<SkapObject>;
/** Generate the skeleton of the objects */
const skapToObjectsPartial = (object: SkapFile.Object, room: SkapFile.Room, map: SkapFile.Map): PartialSkapObject => {
	const id = createId(`obj-${object.type}`);
	switch (object.type) {
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
			return {
				type: object.type,
				id,
				bounds: skapToBounds(object.position, object.size),
			}
		case "text": return {
			type: "text",
			id,
			pos: skapToVec2(object.position),
			text: object.text,
		}
		case "block": return {
			type: "block",
			id,
			bounds: skapToBounds(object.position, object.size),
			color: skapToRgba([...object.color, object.opacity]),
			layer: object.layer,
			solid: object.collide,
		}
		case "gravityZone": return {
			type: "gravityZone",
			id,
			bounds: skapToBounds(object.position, object.size),
			direction:
				object.dir === 0 ||
					object.dir === 1 ||
					object.dir === 2 ||
					object.dir === 3
					? { type: "cardinal", direction: object.dir }
					: { type: "free", direction: 90 * object.dir % 360 }
		}
		case "teleporter": return {
			type: "teleporter",
			id,
			bounds: skapToBounds(object.position, object.size),
			direction: object.dir,
			skapId: object.id,
			targetRoom: object.targetArea,
			targetSkapId: object.targetId,
		}
		case "circularObstacle":
		case "circularLava":
		case "circularSlime":
		case "circularIce":
		case "movingObstacle":
		case "movingLava":
		case "movingSlime":
		case "movingIce":
		case "rotatingLava":
		case "turret":
		case "door":
		case "button":
		case "switch":
		case "spawner":
		case "reward":
		case "hatReward":
			return {
				type: "text",
				id,
				pos: (
					"position" in object
						? skapToVec2(object.position)
						: "points" in object && object.points.length > 0
							? skapToVec2(object.points[0].position)
							: vec2(0)
				),
				text: `⟨${object.type}⟩`,
			};
	}
}

type PartialSkapRoom = Omit<SkapRoom, "objects"> & {
	objects: PartialSkapObject[];
}
/** Generate rooms with partial objects */
const skapToRoomPartial = (room: SkapFile.Room, map: SkapFile.Map): PartialSkapRoom => {
	const objects = room.objects.map(o => skapToObjectsPartial(o, room, map));
	return {
		id: createId("room"),
		name: room.name,
		bounds: new Bounds({
			topLeft: vec2(0),
			bottomRight: skapToVec2(room.size)
		}),
		backgroundColor: room.areaColor
			? skapToRgb(room.areaColor)
			: Color.DEFAULT_BACKGROUND,
		obstacleColor: room.backgroundColor
			? skapToRgba(room.backgroundColor)
			: Color.DEFAULT_OBSTACLE,
		objects,
	};
}

const completeObject = (object: PartialSkapObject, room: PartialSkapRoom, rooms: PartialSkapRoom[], map: SkapFile.Map): SkapObject => {
	switch (object.type) {
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
		case "text":
		case "block":
		case "gravityZone":
			{ return object; }
		case "teleporter": {
			const { bounds, id, direction } = object;
			const targetRoom = rooms.find(room => room.name === object.targetRoom);
			if (!targetRoom) {
				// No way to find the teleporter's destination.
				// throw for now, may implement fallback later
				throw new Error(`Could not find destination for teleporter in ${room.name}, id ${object.skapId}.`, {
					cause: { object }
				});
			}
			const targetTp = targetRoom
				.objects
				.filter(obj => obj.type === "teleporter")
				.find(obj => obj.skapId === object.targetSkapId);

			if (!targetTp) {
				// Fallback to a "room" teleporter
				return {
					type: "teleporter",
					id,
					bounds,
					direction,
					target: {
						type: "room",
						roomId: room.id,
					}
				}
			}
			return {
				type: "teleporter",
				id,
				bounds,
				direction,
				target: {
					type: "teleporter",
					teleporterId: targetTp.id,
				}
			}
		}
	}
}
const completeRoom = (room: PartialSkapRoom, rooms: PartialSkapRoom[], map: SkapFile.Map): SkapRoom => {
	return {
		...room,
		objects: toIdMap(room.objects.map(o => completeObject(o, room, rooms, map)))
	};
}

export const skapToMap = (map: SkapFile.Map): SkapMap => {
	const { settings: {
		name,
		creator: author,
		spawnArea,
		spawnPosition,
		version,
	}, maps } = map;

	const partialRooms = maps.map(r => skapToRoomPartial(r, map));
	const roomList = partialRooms.map(r => completeRoom(r, partialRooms, map));

	const spawnRoom = roomList.find(r => r.name === spawnArea);
	if (!spawnRoom) throw new Error("error.import.no_spawn_room");

	return {
		author, name, version: version ?? 0,
		spawn: {
			room: spawnRoom.id,
			position: skapToVec2(spawnPosition).sub(spawnRoom.bounds.topLeft),
		},
		rooms: toIdMap(roomList),
	};
}