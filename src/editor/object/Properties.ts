import { BaseObject, SkapObjectProperties } from "./Base.tsx";
import { iceProperties, lavaProperties, obstacleProperties, slimeProperties } from "./basic.ts";
import { blockProperties } from "./block.tsx";
import { gravityZoneProperties } from "./gravityZone.tsx";
import { spawnerProperties } from "./spawner.tsx";
import { teleporterProperties } from "./teleporter.tsx";
import { textProperties } from "./text.tsx";

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
];

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