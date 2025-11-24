import { BinaryFormat, dataViewStr } from "./defs.ts";
import { BFArray, BFBigInt, BFBoolean, BFConst, BFDiscriminatedUnion, BFNumber, BFObject, BFString, BFTransform, BFTuple } from "./types.ts";

export type {
	Infer as infer,
	BFConst, BFTransform, BFDiscriminatedUnion,
	BFArray, BFTuple, BFObject,
	BFBoolean, BFNumber, BFBigInt,
} from "./types.ts";

const _const = <const T>(value: T) => new BFConst(value);
export { _const as const };
export const transform = <T, U, B extends BinaryFormat<U>>(base: B, encode: (value: T) => U, decode: (value: U) => T) =>
	new BFTransform(base, encode, decode);
export const array = <T, F extends BinaryFormat<T>>(format: F, lengthLittleEndian: boolean = true) =>
	new BFArray(format, lengthLittleEndian);
export const tuple = <const T extends readonly BinaryFormat[]>(formats: T) => new BFTuple(formats);
export const object = <const T extends [string, BinaryFormat][]>(formats: T) => new BFObject(formats);
export const discriminatedUnion = <
	const K extends PropertyKey,
	const F extends [unknown, BinaryFormat<{ [k in K]: unknown }>][]
>(
	key: K,
	formats: F,
	discriminatorLittleEndian: boolean = true
) => new BFDiscriminatedUnion(key, formats, discriminatorLittleEndian);

export const boolean = () => new BFBoolean();
export const string = (lengthLittleEndian: boolean = true) => new BFString(lengthLittleEndian);
// #region number
export const float16 = (littleEndian: boolean = true) => new BFNumber(
	16 / 8,
	"getFloat16",
	"setFloat16",
	littleEndian,
);
export const float32 = (littleEndian: boolean = true) => new BFNumber(
	32 / 8,
	"getFloat32",
	"setFloat32",
	littleEndian,
);
export const float64 = (littleEndian: boolean = true) => new BFNumber(
	64 / 8,
	"getFloat64",
	"setFloat64",
	littleEndian,
);
export const uint8 = (littleEndian: boolean = true) => new BFNumber(
	8 / 8,
	"getUint8",
	"setUint8",
	littleEndian,
);
export const uint16 = (littleEndian: boolean = true) => new BFNumber(
	16 / 8,
	"getUint16",
	"setUint16",
	littleEndian,
);
export const uint32 = (littleEndian: boolean = true) => new BFNumber(
	32 / 8,
	"getUint32",
	"setUint32",
	littleEndian,
);
export const int8 = (littleEndian: boolean = true) => new BFNumber(
	8 / 8,
	"getInt8",
	"setInt8",
	littleEndian,
);
export const int16 = (littleEndian: boolean = true) => new BFNumber(
	16 / 8,
	"getInt16",
	"setInt16",
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
// #endregion


export const dummy = float64();