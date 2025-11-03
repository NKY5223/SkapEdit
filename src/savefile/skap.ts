import * as z from "zod";

// CANNOT be assed to make this typesafe
// just trust me bro
// @ts-expect-error
const typedParseFloat = <T extends number>(input: `${T}` | T): T => +input;

const NonNaN = z.number().or(z.literal([Infinity, -Infinity]));
const Vec2 = z.tuple([NonNaN, NonNaN]);
const SkapId = z.number().or(z.string());
const RgbColor = z.tuple([z.number(), z.number(), z.number()]);
const RgbaColor = z.tuple([z.number(), z.number(), z.number(), z.number()]);

// #region objects
const rectObject = <T extends string>(type: T) => z.object({
	type: z.literal(type),
	position: Vec2,
	size: Vec2,
});
const circleObject = <T extends string>(type: T) => z.object({
	type: z.literal(type),
	position: Vec2,
	radius: NonNaN,
});
const positionObject = <T extends string>(type: T) => z.object({
	type: z.literal(type),
	position: Vec2,
})

// #region basic
const Obstacle = rectObject("obstacle");
const Lava = rectObject("lava");
const Slime = rectObject("slime");
const Ice = rectObject("ice");
// #endregion

// #region block
const BlockLayer = z.literal([0, 1]);
const BlockLayerLoose = z.codec(
	z.literal([0, 1, "0", "1"]),
	BlockLayer,
	{
		decode: typedParseFloat,
		encode: n => n
	}
);
const Block = rectObject("block").extend({
	layer: BlockLayerLoose,
	collide: z.boolean(),
	color: RgbColor,
	opacity: z.number(),
});
// #endregion

// #region text
const Text = positionObject("text").extend({
	text: z.string()
});
// #endregion

// #region gravity zone
const GravityZone = rectObject("gravityZone").extend({
	// Allow number directions (for zero-gravity and funny spinning zones)
	dir: z.coerce.number(),
});
// #endregion

// #region teleporter
const CardinalDirection = z.literal([0, 1, 2, 3]);
const LooseCardinalDirection = z.codec(
	z.literal([
		0, 1, 2, 3,
		"0", "1", "2", "3"
	]),
	CardinalDirection,
	{
		decode: typedParseFloat,
		encode: n => n,
	}
);
const Teleporter = rectObject("teleporter").extend({
	id: SkapId,
	targetArea: z.string(),
	targetId: SkapId,
	dir: LooseCardinalDirection,
});
// #endregion

// #region circular
const CircularObstacle = circleObject("circularObstacle");
const CircularLava = circleObject("circularLava");
const CircularSlime = circleObject("circularSlime");
const CircularIce = circleObject("circularIce");
// #endregion

// #region moving
const movingObject = <T extends string>(type: T) => z.object({
	type: z.literal(type),
	size: Vec2,
	points: z.object({
		position: Vec2,
		vel: NonNaN,
	}).array().min(1),
});
const MovingObstacle = movingObject("movingObstacle");
const MovingLava = movingObject("movingLava");
const MovingSlime = movingObject("movingSlime");
const MovingIce = movingObject("movingIce");
// #endregion

// #region rotating
const rotatingObject = <T extends string>(type: T) => z.object({
	type: z.literal(type),
	position: Vec2,
	size: Vec2,
	point: Vec2,
	speed: NonNaN,
	startAngle: NonNaN,
});
const RotatingLava = rotatingObject("rotatingLava");
// #endregion

// #region turret
const Turret = circleObject("turret").extend({
	regionPosition: Vec2,
	regionSize: Vec2,

	// shootingSpeed = interval of bullets in burst, in s
	shootingSpeed: z.number(),
	// overHeat = number of bullets in a burst
	overHeat: z.int().nonnegative(),
	// speed = bullet speed, in unit/s
	speed: z.number(),
	// coolDownTime = time between bursts 
	// (gap between last bullet to first, not interval), in s
	coolDownTime: z.number(),
});
// #endregion

// #region door, button, switch
const Door = rectObject("door").extend({
	linkIds: SkapId.array()
});
const Button = rectObject("button").extend({
	id: SkapId,
	dir: LooseCardinalDirection,
	time: NonNaN,
});
const Switch = rectObject("switch").extend({
	id: SkapId,
	dir: LooseCardinalDirection,
});
// #endregion

// #region spawner
const EntityType = z.literal([
	"normal",
	"reverse",
	"spike",
	"bouncer",
	"rotating",
	"following",
	"bomb",
	"monster",
	"taker",
	"contractor",
	"expander",
	"immune",
	"snek",
	"wavy",
	"shooter",
	"stutter",
	"megaBouncer",
	"freezer",
	"disabler",
	"gravityRight",
	"gravityUp",
	"gravityLeft",
	"drainer",
	"harmless",
	"decelerator",
	"accelerator",
]);
const Spawner = rectObject("spawner").extend({
	entityType: EntityType,
	number: z.int().nonnegative(),
	speed: NonNaN,
	radius: NonNaN,
});
// #endregion

// #region reward
const Reward = positionObject("reward").extend({
	reward: z.string(),
})
const HatReward = positionObject("hatReward").extend({
	reward: z.string(),
})
// #endregion

const SkapObject = z.discriminatedUnion("type", [
	Obstacle,
	Lava,
	Slime,
	Ice,
	Block,
	Text,
	GravityZone,
	Teleporter,
	CircularObstacle,
	CircularLava,
	CircularSlime,
	CircularIce,
	MovingObstacle,
	MovingLava,
	MovingSlime,
	MovingIce,
	RotatingLava,
	Turret,
	Door,
	Button,
	Switch,
	Spawner,
	Reward,
	HatReward,
]);

// #endregion

const Room = z.object({
	name: z.string(),
	size: Vec2,
	backgroundColor: RgbaColor.optional(),
	areaColor: RgbColor.optional(),
	objects: SkapObject.array(),
});

const Settings = z.object({
	name: z.string(),
	creator: z.string(),
	spawnArea: z.string(),
	spawnPosition: Vec2,
	version: z.union([z.null(), z.int()]),
});

const SkapMap = z.object({
	settings: Settings,
	maps: Room.array(),
});

if (import.meta.env.DEV) {
	fetch(`./maps/test.json`)
		.then(res => res.json())
		.then(map => console.log(SkapMap.parse(map)))
		.catch(err => console.error("Could not fetch test map:", err));
	try {
		console.log(`Skap map $schema:`, z.toJSONSchema(SkapMap));
	} catch (err) {
		console.error("could not generate skap map $schema", err);
	}
}

/** 
 * Types for skap .json files. 
 * Do not import * from, it contains naming conflicts. 
 */
export namespace SkapFile {
	export type Map = z.infer<typeof SkapMap>;
	export type Settings = z.infer<typeof Settings>;
	export type Room = z.infer<typeof Room>;
	export type Object = z.infer<typeof SkapObject>;

	export type Vec2 = z.infer<typeof Vec2>;
}