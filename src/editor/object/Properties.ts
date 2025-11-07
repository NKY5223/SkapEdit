import { BaseObject, SkapObjectProperties } from "./Base.ts";
import { iceProperties, lavaProperties, obstacleProperties, slimeProperties } from "./basic.ts";
import { blockProperties } from "./block.ts";
import { textProperties } from "./text.ts";

const properties = [
	obstacleProperties,
	lavaProperties,
	slimeProperties,
	iceProperties,
	textProperties,
	blockProperties,
];

export const getProperties = <T extends string, O extends BaseObject<T, {}>>(obj: O): SkapObjectProperties<T, O> => {
	const find = properties.find(p => p.type === obj.type);
	if (!find) throw new Error(`Could not find SkapObjectProperties for object type ${obj.type}`, {
		cause: obj,
	});
	// @ts-expect-error Cannot guarantee type safety, but this will do
	return find;
}