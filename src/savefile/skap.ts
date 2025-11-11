import * as z from "zod";

// CANNOT be assed to make this typesafe
// just trust me bro
// @ts-expect-error
const typedParseFloat = <T extends number>(input: `${T}` | T): T => +input;

const NonNaN = z.number().or(z.literal([Infinity, -Infinity]));
const Vec2 = z.tuple([NonNaN, NonNaN]).readonly();
const SkapId = z.number().or(z.string());
const RgbColor = z.tuple([z.number(), z.number(), z.number()]).readonly();
const RgbaColor = z.tuple([z.number(), z.number(), z.number(), z.number()]).readonly();

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
	overHeat: z.number(),
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
const EntityType = z.string();

// List from skap.io/editor.bundle.js
[
	'normal', 
	'reverse', 
	'spike', 
	'bouncer', 
	'rotating', 
	'following', 
	'bomb', 
	'monster', 
	'taker', 
	'contractor', 
	'immune', 
	'expander', 
	'wavy', 
	'snek', 
	'daddySnek', 
	'babySnek', 
	'stutter', 
	'shooter', 
	'freezer', 
	'megaBouncer', 
	'gravityLeft', 
	'gravityUp', 
	'gravityRight', 
	'disabler', 
	'accelerator', 
	'decelerator', 
	'drainer', 
	'harmless'
]

const Spawner = rectObject("spawner").extend({
	entityType: EntityType,
	number: z.number(),
	speed: NonNaN,
	radius: NonNaN,
});
// #endregion

// #region reward
const Reward = positionObject("reward").extend({
	reward: z.number().array(),
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
	gravity: z.number().optional(),
	backgroundColor: RgbaColor.optional(),
	areaColor: RgbColor.optional(),
	objects: SkapObject.array(),
});

const Settings = z.object({
	name: z.string(),
	creator: z.string(),
	spawnArea: z.string(),
	spawnPosition: Vec2,
	version: z.union([z.null(), z.number()]),
});

/** This is just `show T from x` */
const id = <T>(x: T) => x;

export const SkapMapSchema = z.object({
	$schema: 
		z.enum([
			"https://nky5223.github.io/SkapEdit/schema/skap/0.1.2.json",
			"https://nky5223.github.io/SkapEdit/schema/skap/0.1.3.json",
		]).or(id<z.ZodType<string & {}>>(z.string())).optional(),
	settings: Settings,
	maps: Room.array(),
});

Object.assign(window, {
	generateSkap$schema: () => z.toJSONSchema(SkapMapSchema)
});

/** 
 * Types for skap .json files. 
 * Do not import * from, it contains naming conflicts. 
 */
export namespace SkapFile {
	export type Map = z.infer<typeof SkapMapSchema>;
	export type Settings = z.infer<typeof Settings>;
	export type Room = z.infer<typeof Room>;
	export type Object = z.infer<typeof SkapObject>;

	export type Vec2 = z.infer<typeof Vec2>;
	export type Rgb = z.infer<typeof RgbColor>;
	export type Rgba = z.infer<typeof RgbaColor>;
	export type Id = z.infer<typeof SkapId>;
}