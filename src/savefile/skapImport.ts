import { toIdMap, SkapMap, SkapObject, SkapRoom } from "@editor/map.ts";
import { SkapFile } from "./skap.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import { createId, ID } from "@common/uuid.ts";
import { SkapText } from "@editor/object/text.ts";
import { Bounds } from "@editor/bounds.ts";
import { Color } from "@common/color.ts";

const skapToVec2 = (v: SkapFile.Vec2): Vec2 => vec2(...v);
const rgbToSkap = (c: SkapFile.Rgb): Color => Color.rgb255(...c);
const rgbaToSkap = (c: SkapFile.Rgba): Color => Color.rgb255(...c);

const defaultObstacleColor: SkapFile.Rgba = [0x00, 0x0a, 0x57, 0.8];
const defaultBackgroundColor: SkapFile.Rgb = [0xe6, 0xe6, 0xe6];

type P<T> = T extends never
	? {
		// type: "text";
		// id: ID;
		// position: Vec2;
	}
	: T
type PartialSkapObject = P<SkapObject>;
/** Generate the skeleton of the objects */
const skapToObjectsPartial = (object: SkapFile.Object, room: SkapFile.Room, map: SkapFile.Map): PartialSkapObject => {
	const id = createId(`obj-${object.type}`);
	switch (object.type) {
		case "obstacle": return {
			type: "obstacle",
			id,
			bounds: new Bounds({ pos: skapToVec2(object.position), size: skapToVec2(object.size) })
		}
		case "lava": return {
			type: "lava",
			id,
			bounds: new Bounds({ pos: skapToVec2(object.position), size: skapToVec2(object.size) })
		}
		case "text": return {
			type: "text",
			id,
			pos: skapToVec2(object.position),
			text: object.text,
		}
		case "slime":
		case "ice":
		case "block":
		case "gravityZone":
		case "teleporter":
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
				id: createId("text"),
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
		backgroundColor: rgbToSkap(room.areaColor ?? defaultBackgroundColor),
		obstacleColor: rgbaToSkap(room.backgroundColor ?? defaultObstacleColor),
		objects,
	};
}

const completeObject = (object: PartialSkapObject, rooms: PartialSkapRoom[], map: SkapFile.Map): SkapObject => {
	switch (object.type) {
		case "obstacle":
		case "lava":
		case "text":
			{ return object; }
	}
}
const completeRoom = (room: PartialSkapRoom, rooms: PartialSkapRoom[], map: SkapFile.Map): SkapRoom => {
	return {
		...room,
		objects: toIdMap(room.objects.map(o => completeObject(o, rooms, map)))
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