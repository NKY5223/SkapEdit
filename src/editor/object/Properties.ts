import { SkapObject } from "@editor/map.ts";
import { BaseObject, SkapObjectProperties } from "./Base.tsx";
import { iceProperties, lavaProperties, obstacleProperties, slimeProperties } from "./basic.ts";
import { blockProperties } from "./block.tsx";
import { circularIceProperties, circularLavaProperties, circularObstacleProperties, circularSlimeProperties } from "./circular.tsx";
import { gravityZoneProperties } from "./gravityZone.tsx";
import { movingObstacleProperties, movingLavaProperties, movingSlimeProperties, movingIceProperties } from "./moving.tsx";
import { rotatingLavaProperties } from "./rotating.tsx";
import { spawnerProperties } from "./spawner.tsx";
import { teleporterProperties } from "./teleporter.tsx";
import { textProperties } from "./text.tsx";
import { turretProperties } from "./turret.tsx";
import { doorProperties } from "./door.tsx";
import { buttonProperties } from "./button.tsx";
import { switchProperties } from "./switch.tsx";
import { rewardProperties } from "./reward.tsx";
import { hatRewardProperties } from "./hatReward.tsx";

const properties = [
	obstacleProperties,
	lavaProperties,
	slimeProperties,
	iceProperties,

	textProperties,
	blockProperties,
	gravityZoneProperties,
	teleporterProperties,
	spawnerProperties,

	rotatingLavaProperties,

	circularObstacleProperties,
	circularLavaProperties,
	circularSlimeProperties,
	circularIceProperties,

	movingObstacleProperties,
	movingLavaProperties,
	movingSlimeProperties,
	movingIceProperties,

	turretProperties,
	doorProperties,
	buttonProperties,
	switchProperties,

	rewardProperties,
	hatRewardProperties,
];

type Assert<T extends true> = T;
type Extract<T> = T extends SkapObjectProperties<infer S, infer T> ? T : never;
type Implemented = Extract<typeof properties[number]>;
type Unimplemented = Exclude<SkapObject, Implemented>;
type test = Assert<Unimplemented extends never ? true : false>;
true satisfies test;

Object.assign(window, { logZIndices: () => {
	properties.forEach(p => {
		const z = p.selection.zIndex;
		if (z.length === 0) {
			// @ts-expect-error
			console.log(p.type, z(0));
		} else {
			console.log(p.type, z);
		}
	});
} });

export const getProperties = <T extends string, O extends BaseObject<T, {}>>(obj: O): SkapObjectProperties<T, O> => {
	const find = properties.find(p => p.type === obj.type);
	if (!find) throw new Error(`Could not find SkapObjectProperties for object type ${obj.type}`, {
		cause: obj,
	});
	// @ts-expect-error Cannot guarantee type safety, but this will do
	return find;
}