import { ID } from "@common/uuid.ts";
import { Bounds } from "@editor/bounds.ts";
import * as b from "./binary/index.ts";
import { MapFragment, SkapMap, SkapObject, SkapRoom } from "@editor/map.ts";
import { bytesStr } from "./binary/utils.ts";
import { vec2, Vec2 } from "@common/vec2.ts";
import { SkapText } from "@editor/object/text.tsx";
import { SkapIce, SkapLava, SkapObstacle, SkapSlime } from "@editor/object/basic.ts";
import { SkapBlock } from "@editor/object/block.tsx";
import { Color } from "@common/color.ts";
import { CardinalDirection, isCardinalDirection } from "@editor/object/Base.tsx";
import { SkapTeleporter } from "@editor/object/teleporter.tsx";
import { SkapGravityZone } from "@editor/object/gravityZone.tsx";
import { SkapSpawner } from "@editor/object/spawner.tsx";
import { SkapRotatingIce, SkapRotatingLava, SkapRotatingObstacle, SkapRotatingSlime } from "@editor/object/rotating.tsx";
import { SkapCircularObstacle, SkapCircularLava, SkapCircularSlime, SkapCircularIce } from "@editor/object/circular.tsx";
import { SkapMovingObstacle, SkapMovingLava, SkapMovingSlime, SkapMovingIce } from "@editor/object/moving.tsx";
import { SkapTurret } from "@editor/object/turret.tsx";
import { SkapDoor } from "@editor/object/door.tsx";
import { SkapButton } from "@editor/object/button.tsx";
import { SkapSwitch } from "@editor/object/switch.tsx";
import { SkapReward } from "@editor/object/reward.tsx";
import { SkapHatReward } from "@editor/object/hatReward.tsx";

// #region Basic data types
const IdFormat = b.string().transform<ID>(s => s, s => s as ID).opaque();
const BoundsFormat = b.tuple([
	b.float64(),
	b.float64(),
	b.float64(),
	b.float64(),
]).transform<Bounds>(
	bounds => [bounds.left, bounds.top, bounds.right, bounds.bottom],
	([left, top, right, bottom]) => new Bounds({ left, top, right, bottom }),
).opaque();
const Vec2Format = b.tuple([
	b.float64(),
	b.float64(),
]).transform<Vec2>(
	([x, y]) => [x, y],
	([x, y]) => vec2(x, y),
).opaque();
const ColorFormat = b.discriminatedUnion("type", [
	["rgba", b.object([
		["type", b.const("rgba")],
		["r", b.float64()],
		["g", b.float64()],
		["b", b.float64()],
		["a", b.float64()],
	])],
	["hsva", b.object([
		["type", b.const("hsva")],
		["h", b.float64()],
		["s", b.float64()],
		["v", b.float64()],
		["a", b.float64()],
	])],
]).transform<Color>(
	color => color.data,
	data => new Color(data),
).opaque();
const CardinalDirectionFormat = b.uint8().transform<CardinalDirection>(
	n => n,
	n => isCardinalDirection(n) ? n : CardinalDirection.Down,
).opaque();
// #endregion

// #region Object types
const BaseObject = <const T>(type: T) => b.object([
	["type", b.const(type)],
	["id", IdFormat],
]);
const BoundsObject = <const T>(type: T) => BaseObject(type).extend([
	["bounds", BoundsFormat],
]);
const RotatingObject = <const T>(type: T) => BoundsObject(type).extend([
	["rotation", b.object([
		["center", Vec2Format],
		["initial", b.float64()],
		["speed", b.float64()],
	])],
]);
const CircularObject = <const T>(type: T) => BaseObject(type).extend([
	["pos", Vec2Format],
	["radius", b.float64()],
]);
const MovingObject = <const T>(type: T) => BaseObject(type).extend([
	["size", Vec2Format],
	["period", b.float64()],
	["points", b.object([
		["pos", Vec2Format],
		["time", b.float64()],
	]).array()],
]);

const ObstacleFormat = BoundsObject("obstacle").assert<SkapObstacle>();
const LavaFormat = BoundsObject("lava").assert<SkapLava>();
const SlimeFormat = BoundsObject("slime").assert<SkapSlime>();
const IceFormat = BoundsObject("ice").assert<SkapIce>();
const TextFormat = BaseObject("text").extend([
	["pos", Vec2Format],
	["text", b.string()],
]).assert<SkapText>();
const BlockFormat = BoundsObject("block").extend([
	["color", ColorFormat],
	["layer", b.uint8().transform<0 | 1>(n => n, n => n === 0 ? 0 : 1)],
	["solid", b.boolean()],
]).assert<SkapBlock>();
const TeleporterFormat = BoundsObject("teleporter").extend([
	["direction", CardinalDirectionFormat],
	// Model `target` as if null was { type: "none" }, then convert between.
	["target", b.discriminatedUnion("type", [
		["none", b.const({ type: "none" })],
		["room", b.object([
			["type", b.const("room")],
			["roomId", IdFormat],
		])],
		["teleporter", b.object([
			["type", b.const("teleporter")],
			["teleporterId", IdFormat],
		])],
	]).transform<SkapTeleporter["target"]>(
		v => v === null ? { type: "none" } : v,
		v => v.type === "none" ? null : v,
	)]
]).assert<SkapTeleporter>();
const GravityZoneFormat = BoundsObject("gravityZone").extend([
	["direction", b.discriminatedUnion("type", [
		["free", b.object([
			["type", b.const("free")],
			["direction", b.float64()],
		])],
		["cardinal", b.object([
			["type", b.const("cardinal")],
			["direction", CardinalDirectionFormat],
		])],
	])],
]).assert<SkapGravityZone>();
const SpawnerFormat = BoundsObject("spawner").extend([
	["entities", b.object([
		["type", b.string()],
		["count", b.int32()],
		["speed", b.float64()],
		["radius", b.float64()],
	]).array()]
]).assert<SkapSpawner>();
const RotatingObstacleFormat = RotatingObject("rotatingObstacle").assert<SkapRotatingObstacle>();
const RotatingLavaFormat = RotatingObject("rotatingLava").assert<SkapRotatingLava>();
const RotatingSlimeFormat = RotatingObject("rotatingSlime").assert<SkapRotatingSlime>();
const RotatingIceFormat = RotatingObject("rotatingIce").assert<SkapRotatingIce>();
const CircularObstacleFormat = CircularObject("circularObstacle").assert<SkapCircularObstacle>();
const CircularLavaFormat = CircularObject("circularLava").assert<SkapCircularLava>();
const CircularSlimeFormat = CircularObject("circularSlime").assert<SkapCircularSlime>();
const CircularIceFormat = CircularObject("circularIce").assert<SkapCircularIce>();
const MovingObstacleFormat = MovingObject("movingObstacle").assert<SkapMovingObstacle>();
const MovingLavaFormat = MovingObject("movingLava").assert<SkapMovingLava>();
const MovingSlimeFormat = MovingObject("movingSlime").assert<SkapMovingSlime>();
const MovingIceFormat = MovingObject("movingIce").assert<SkapMovingIce>();
const TurretFormat = BaseObject("turret").extend([
	["pos", Vec2Format],
	["region", BoundsFormat],
	["bulletRadius", b.float64()],
	["bulletSpeed", b.float64()],
	["bulletInterval", b.float64()],
	["groupSize", b.float64()],
	["groupInterval", b.float64()],
]).assert<SkapTurret>();
const DoorFormat = BoundsObject("door").extend([
	["connections", b.object([
		["objectId", IdFormat],
		["hidden", b.boolean()],
		["invert", b.boolean()],
	]).array()]
]).assert<SkapDoor>();
const ButtonFormat = BoundsObject("button").extend([
	["name", b.string()],
	["dir", CardinalDirectionFormat],
	["timer", b.float64()],
]).assert<SkapButton>();
const SwitchFormat = BoundsObject("switch").extend([
	["name", b.string()],
	["dir", CardinalDirectionFormat],
]).assert<SkapSwitch>();
const RewardFormat = BaseObject("reward").extend([
	["pos", Vec2Format],
	["reward", b.float64().array()],
]).assert<SkapReward>();
const HatRewardFormat = BaseObject("hatReward").extend([
	["pos", Vec2Format],
	["hatReward", b.string()],
]).assert<SkapHatReward>();
// #endregion

// DANGER: Changing the order of formats breaks things! 
export const SkapObjectFormat = b.discriminatedUnion("type", [
	["obstacle", ObstacleFormat],
	["lava", LavaFormat],
	["slime", SlimeFormat],
	["ice", IceFormat],
	["text", TextFormat],
	["block", BlockFormat],
	["teleporter", TeleporterFormat],
	["gravityZone", GravityZoneFormat],
	["spawner", SpawnerFormat],
	["rotatingObstacle", RotatingObstacleFormat],
	["rotatingLava", RotatingLavaFormat],
	["rotatingSlime", RotatingSlimeFormat],
	["rotatingIce", RotatingIceFormat],
	["circularObstacle", CircularObstacleFormat],
	["circularLava", CircularLavaFormat],
	["circularSlime", CircularSlimeFormat],
	["circularIce", CircularIceFormat],
	["movingObstacle", MovingObstacleFormat],
	["movingLava", MovingLavaFormat],
	["movingSlime", MovingSlimeFormat],
	["movingIce", MovingIceFormat],
	["turret", TurretFormat],
	["door", DoorFormat],
	["button", ButtonFormat],
	["switch", SwitchFormat],
	["reward", RewardFormat],
	["hatReward", HatRewardFormat],
]).opaque<SkapObject>();

export const SkapRoomFormat = b.object([
	["id", IdFormat],
	["name", b.string()],
	["bounds", BoundsFormat],
	["obstacleColor", ColorFormat],
	["backgroundColor", ColorFormat],
	["objects", b.readonlyMap(IdFormat, SkapObjectFormat)],
]).opaque<SkapRoom>();

export const SkapMapFormat = b.object([
	["author", b.string()],
	["name", b.string()],
	["version", b.float64()],
	["spawn", b.object([
		["room", IdFormat],
		["position", Vec2Format],
	])],
	["rooms", b.readonlyMap(IdFormat, SkapRoomFormat)],
	["edited", b.const<boolean>(false)],
]).opaque<SkapMap>();
/** The literal bytes `⟨53 6b 61 70 45 64 69 74⟩`. */
const BytesSkapEdit = new TextEncoder().encode("SkapEdit");
export const MapFileFormat = b.tuple([
	b.literal(BytesSkapEdit),
	SkapMapFormat,
]);

export const MapFragmentFormat = b.object([
	["objects", SkapObjectFormat.array()],
	["rooms", SkapRoomFormat.array()],
]).opaque<MapFragment>();