import { BinaryFormat, dataViewStr } from "./defs.ts";
import { BFArray, BFBigInt, BFBoolean, BFNumber, BFObject, BFString, BFTransform, BFTuple } from "./types.ts";

export type {
	Infer as infer,
	BFArray, BFTuple, BFObject,
	BFBoolean, BFNumber, BFBigInt,
} from "./types.ts";

export const transform = <T, U, B extends BinaryFormat<U>>(base: B, encode: (value: T) => U, decode: (value: U) => T) =>
	new BFTransform(base, encode, decode);
export const array = <T, F extends BinaryFormat<T>>(format: F, lengthLittleEndian: boolean = true) =>
	new BFArray(format, lengthLittleEndian);
export const tuple = <T extends readonly BinaryFormat[]>(formats: T) => new BFTuple(formats);
export const object = <const T extends [string, BinaryFormat][]>(formats: T) => new BFObject(formats);
export const boolean = () => new BFBoolean();
export const string = (lengthLittleEndian: boolean = true) => new BFString(lengthLittleEndian);
export const float64 = (littleEndian: boolean = true) => new BFNumber(
	64 / 8,
	"getFloat64",
	"setFloat64",
	littleEndian,
);
export const int32 = (littleEndian: boolean = true) => new BFNumber(
	32 / 8,
	"getInt32",
	"setInt32",
	littleEndian,
);
export const bigInt64 = (littleEndian: boolean = true) => new BFBigInt(
	"getBigInt64",
	"setBigInt64",
	littleEndian,
);
export const bigUint64 = (littleEndian: boolean = true) => new BFBigInt(
	"getBigUint64",
	"setBigUint64",
	littleEndian,
);

const format = object([
	["number", float64()],
	["boolean", boolean()],
	["boolean2", boolean()],
	["string", string()],
]);
console.log(format);
const encoded = format.encode(
	{
		number: 1,
		boolean: true,
		boolean2: false,
		string: "owo变故⇇",
	},
);
const dataView = new DataView(encoded);
console.log("Encoded:", dataViewStr(dataView));
const decoded = format.decode(encoded);
console.log("Decoded:", decoded);

export const dummy = float64();