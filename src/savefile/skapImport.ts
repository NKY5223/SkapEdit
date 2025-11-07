import { Color } from "@common/color.ts";
import { createId } from "@common/uuid.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import { Bounds } from "@editor/bounds.ts";
import { SkapMap, SkapObject, SkapRoom, toIdMap } from "@editor/map.ts";
import { SkapFile } from "./skap.ts";

const skapToVec2 = (v: SkapFile.Vec2): Vec2 => vec2(...v);
const rgbToSkap = (c: SkapFile.Rgb): Color => Color.rgb255(...c);
const rgbaToSkap = (c: SkapFile.Rgba): Color => Color.rgb255(...c);

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
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
			return {
				type: object.type,
				id,
				bounds: new Bounds({ pos: skapToVec2(object.position), size: skapToVec2(object.size) })
			}
		case "text": return {
			type: "text",
			id,
			pos: skapToVec2(object.position),
			text: object.text,
		}
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
			? rgbToSkap(room.areaColor)
			: Color.DEFAULT_BACKGROUND,
		obstacleColor: room.backgroundColor
			? rgbaToSkap(room.backgroundColor)
			: Color.DEFAULT_OBSTACLE,
		objects,
	};
}

const completeObject = (object: PartialSkapObject, rooms: PartialSkapRoom[], map: SkapFile.Map): SkapObject => {
	switch (object.type) {
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
		case "text":
			{ return object; }
	}
	object satisfies never;
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