import { Bounds } from "@editor/bounds.ts";
import * as b from "./binary/index.ts";

const BoundsFormat = b.tuple([
	b.float64(),
	b.float64(),
	b.float64(),
	b.float64(),
]).transform<Bounds>(
	bounds => [bounds.left, bounds.top, bounds.right, bounds.bottom],
	([left, top, right, bottom]) => new Bounds({ left, top, right, bottom }),
).opaque();

const BasicBoundsObject = <const T>(type: T) => b.object([
	["type", b.const(type)],
	["bounds", BoundsFormat],
])
const ObstacleFormat = BasicBoundsObject("obstacle");
const LavaFormat = BasicBoundsObject("lava");
const SlimeFormat = BasicBoundsObject("slime");
const IceFormat = BasicBoundsObject("ice");


const SkapObjectFormat = b.discriminatedUnion("type", [
	["obstacle", ObstacleFormat],
	["lava", LavaFormat],
	["slime", SlimeFormat],
	["ice", IceFormat],
]);