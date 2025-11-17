import { isReadonlyArray } from "@components/translate/richtext.ts";
import { SkapFile } from "./skap.ts";

type Jsonable = (
	| null
	| number
	| string
	| boolean
	| readonly Jsonable[]
	| { [k: string]: Jsonable | undefined; }
);

type test = SkapFile.Map["maps"][number]["objects"] extends Jsonable ? true : false;

const POS_INF = `1e308`;
const NEG_INF = `-1e308`;

export const customJson = (thing: Jsonable, indent: null | string = null): string => {
	if (thing === null) return `null`;
	switch (typeof thing) {
		case "number": {
			if (thing === Infinity) return POS_INF;
			if (thing === -Infinity) return NEG_INF;
			return JSON.stringify(thing);
		}
		case "boolean":
		case "string":
			{
				return JSON.stringify(thing);
			}
	}
	if (isReadonlyArray(thing)) {
		const parts = thing.map(v => customJson(v, indent));
		if (indent === null) {
			return `[${parts.join(",")}]`;
		}
		const lines = parts.join(",\n").split("\n");
		return `[\n${lines.map(l => indent + l).join("\n")}\n]`;
	}
	const parts = Object.entries(thing).map(([k, v]) => {
		if (v === undefined) return null;
		const key = JSON.stringify(k);
		const value = customJson(v, indent);
		if (indent === null) {
			return `${key}:${value}`;
		}
		return `${key}: ${value}`;
	}).filter(v => v !== null);
	if (indent === null) {
		return `{${parts.join(",")}}`;
	}
	const lines = parts.join(",\n").split("\n");
	return `{\n${lines.map(l => indent + l).join("\n")}\n}`;
}