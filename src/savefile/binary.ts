import { ID } from "@common/uuid.ts";
import { Bounds } from "@editor/bounds.ts";
import * as b from "./binary/index.ts";
import { SkapObject } from "@editor/map.ts";
import { bytesStr } from "./binary/defs.ts";

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
// #endregion

const ObjectBase = <const T>(type: T) => b.object([
	["type", b.const(type)],
	["id", IdFormat],
]);
const BoundsObject = <const T>(type: T) => ObjectBase(type).extend([
	["bounds", BoundsFormat],
]);
const ObstacleFormat = BoundsObject("obstacle");
const LavaFormat = BoundsObject("lava");
const SlimeFormat = BoundsObject("slime");
const IceFormat = BoundsObject("ice");

const TextFormat = ObjectBase("text").extend([
	["text", b.string()],
]);

const SkapObjectFormat = b.discriminatedUnion("type", [
	["obstacle", ObstacleFormat],
	["lava", LavaFormat],
	["slime", SlimeFormat],
	["ice", IceFormat],
	["text", TextFormat],
]);

/** ⟨53 6b 61 70 45 64 69 74⟩ */
const BytesSkapEdit = new TextEncoder().encode("SkapEdit");
const MapFileFormat = b.tuple([
	b.literal(BytesSkapEdit),
]);

// console.log(MapFileFormat.encode([void 0]));