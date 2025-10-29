import { BaseObject, SkapObjectProperties } from "./Base.ts";
import { obstacleProperties } from "./obstacle.ts";
import { lavaProperties } from "./lava.ts";
import { textProperties } from "./text.ts";

const properties = [
	obstacleProperties,
	lavaProperties,
	textProperties,
];

export const getProperties = <T extends string, O extends BaseObject<T, {}>>(obj: O): SkapObjectProperties<T, O> => {
	const find = properties.find(p => p.type === obj.type);
	if (!find) throw new Error(`Could not find SkapObjectProperties for object type ${obj.type}`, {
		cause: obj,
	});
	// @ts-expect-error Cannot guarantee type safety, but this will do
	return find;
}