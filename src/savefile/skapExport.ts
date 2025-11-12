import { SkapMap, SkapObject, SkapRoom } from "@editor/map.ts";
import { SkapFile } from "./skap.ts";
import { Vec2 } from "@common/vec2.ts";
import { Color } from "@common/color.ts";
import { Vector } from "@common/vector.ts";
import { mod } from "@common/number.ts";

const vec2ToSkap = (vec: Vec2): SkapFile.Vec2 => vec.components;
const rgbToSkap = (color: Color): SkapFile.Rgb => color.rgb().mul(255).components;
const rgbaMult = new Vector<4>([255, 255, 255, 1]);
const rgbaToSkap = (color: Color): SkapFile.Rgba => color.rgba().mul(rgbaMult).components;

const objectToSkap = (object: SkapObject, room: SkapRoom, map: SkapMap): SkapFile.Object[] => {
	const topLeft = room.bounds.topLeft;
	switch (object.type) {
		case "obstacle":
		case "lava":
		case "slime":
		case "ice":
			return [{
				type: object.type,
				position: vec2ToSkap(object.bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(object.bounds.size),
			}];
		case "text": {
			return [{
				type: object.type,
				position: vec2ToSkap(object.pos.sub(topLeft)),
				text: object.text,
			}];
		}
		case "block": {
			return [{
				type: object.type,
				position: vec2ToSkap(object.bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(object.bounds.size),
				color: rgbToSkap(object.color),
				opacity: object.color.alpha(),
				layer: object.layer,
				collide: object.solid,
			}];
		}
		case "gravityZone": {
			return [{
				type: object.type,
				position: vec2ToSkap(object.bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(object.bounds.size),
				dir: object.direction.type === "cardinal"
					? object.direction.direction
					: mod(object.direction.direction / 90, 4) - 4
			}];
		}
		case "teleporter": {
			const { target } = object;
			if (target === null) {
				return [{
					type: object.type,
					position: vec2ToSkap(object.bounds.topLeft.sub(topLeft)),
					size: vec2ToSkap(object.bounds.size),
					id: object.id,
					targetArea: "",
					dir: object.direction,
					targetId: "",
				}]
			}
			const targetArea = target.type === "teleporter"
				? map.rooms
					.values()
					.find(room => room.objects.has(target.teleporterId))
					?.name
				: map.rooms.get(target.roomId)?.name;
			if (!targetArea) throw new Error("Cannot find target room for teleporter");

			return [{
				type: object.type,
				position: vec2ToSkap(object.bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(object.bounds.size),
				id: object.id,
				targetArea,
				dir: object.direction,
				targetId: target.type === "teleporter"
					? target.teleporterId
					: "",
			}];
		}
		case "spawner": {
			const { bounds, entities } = object;
			const common = {
				type: object.type,
				position: vec2ToSkap(bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(bounds.size),
			} as const;
			return entities.map(({ type, count, speed, radius }) => ({
				...common,
				entityType: type,
				number: count,
				speed,
				radius,
			}));
		}
		case "rotatingLava": {
			const { bounds, rotation: { center, initial, speed } } = object;
			return [{
				type: "rotatingLava",
				position: vec2ToSkap(bounds.topLeft.sub(topLeft)),
				size: vec2ToSkap(bounds.size),
				point: vec2ToSkap(center),
				speed,
				startAngle: initial,
			}];
		}
	}
}

const roomToSkap = (room: SkapRoom, map: SkapMap): SkapFile.Room => {
	return {
		name: room.name,
		size: vec2ToSkap(room.bounds.size),
		areaColor: rgbToSkap(room.backgroundColor),
		backgroundColor: rgbaToSkap(room.obstacleColor),
		objects: room.objects.values().flatMap(obj => objectToSkap(obj, room, map)).toArray(),
	}
}

export const mapToSkap = (map: SkapMap): SkapFile.Map => {
	const spawnRoom = map.rooms.get(map.spawn.room);
	if (!spawnRoom) throw new Error("Could not find spawn room");
	const spawnRoomName = spawnRoom.name;
	// Reposition spawn relative to room
	const spawnPosition = map.spawn.position.sub(spawnRoom.bounds.topLeft);
	return {
		$schema: "https://nky5223.github.io/SkapEdit/schema/skap/0.1.3.json",
		settings: {
			name: map.name,
			creator: map.author,
			version: map.version + 1,
			spawnArea: spawnRoomName,
			spawnPosition: vec2ToSkap(spawnPosition),
		},
		maps: map.rooms.values().map(room => roomToSkap(room, map)).toArray(),
	}
}

export const mapToSkapJson = (map: SkapMap): string => {
	return JSON.stringify(mapToSkap(map));
}