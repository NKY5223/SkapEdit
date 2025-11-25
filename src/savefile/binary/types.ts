import { Realize } from "@common/types.ts";
import { BinaryFormat, bytesStr, sliceDataView } from "./defs.ts";
import { range } from "@common/array.ts";
import { float64, int32, uint16 } from "./index.ts";

export type Infer<T> = T extends BinaryFormat<infer U> ? U : never;
const log = false;

export class BFError extends Error {
	constructor(
		message: string,
		readonly position: number,
		options?: ErrorOptions,
	) {
		super(`@0x${position.toString(16)}: ${message}`, options);
		this.name = "BFError";
	}
}

export abstract class BFBase<T> implements BinaryFormat<T> {
	abstract length(value: T): number;
	abstract encodeInto(value: T, dataView: DataView): void;
	abstract decodeFrom(dataView: DataView): [value: T, advance: number];

	encodeIntoAndAdvance(value: T, dataView: DataView): DataView {
		this.encodeInto(value, dataView);
		return sliceDataView(dataView, this.length(value));
	}
	decodeFromAndAdvance(dataView: DataView): [value: T, dataView: DataView, advance: number] {
		const [value, advance] = this.decodeFrom(dataView);
		return [value, sliceDataView(dataView, advance), advance];
	}

	encode(value: T): ArrayBuffer {
		const size = this.length(value);
		if (log) console.log("encoding with length 0x%s", size.toString(16));
		const buffer = new ArrayBuffer(size);
		const dataView = new DataView(buffer);
		this.encodeInto(value, dataView);
		return buffer;
	}
	decode(buffer: ArrayBuffer): T {
		const dataView = new DataView(buffer);
		const [value, advance] = this.decodeFrom(dataView);
		if (advance > buffer.byteLength) {
			console.warn(
				"Did not consume entire buffer when decoding (%i/%i).",
				advance, buffer.byteLength,
			);
		}
		return value;
	}


	/** Assert that a format decodes to a certain type. */
	assert<T>(this: this & BFBase<T>): this {
		return this;
	}
	/** Cast a format to BFBase, hiding its internal structure. */
	opaque<T>(this: BFBase<T>): BFBase<T> {
		return this;
	}
	array(lengthLittleEndian: boolean = true): BFArray<T, this> {
		return new BFArray(this, lengthLittleEndian);
	}
	transform<U>(
		encode: (value: U) => T,
		decode: (value: T) => U,
	): BFTransform<T, U, this> {
		return new BFTransform(this, encode, decode);
	}
}

export class BFTransform<T, U, B extends BinaryFormat<T>> extends BFBase<U> {
	constructor(
		readonly base: B,
		readonly transformEncode: (value: U) => T,
		readonly transformDecode: (value: T) => U,
	) { super(); }
	length(value: U): number {
		return this.base.length(this.transformEncode(value));
	}
	encodeInto(value: U, dataView: DataView): void {
		this.base.encodeInto(this.transformEncode(value), dataView);
	}
	decodeFrom(dataView: DataView): [value: U, advance: number] {
		const [value, advance] = this.base.decodeFrom(dataView);
		return [
			this.transformDecode(value),
			advance,
		];
	}
}

/**
 * Format: ``
 * 
 * Note: This format does not take any space. It is used for constants (e.g. with BFDiscriminatedUnion.)
 */
export class BFConst<const T> extends BFBase<T> {
	constructor(readonly value: T) { super(); }
	length(value: T): number {
		return 0;
	}
	encodeInto(value: T, dataView: DataView): void {
		return;
	}
	decodeFrom(dataView: DataView): [value: T, advance: number] {
		return [this.value, 0];
	}
}

/**
 * Format: `[bytes]`
 * 
 * Note: Will throw an error if received data does not match expected format.
 */
export class BFLiteral extends BFBase<void> {
	constructor(readonly bytes: Uint8Array) {
		super();
	}
	length(value: void): number {
		return this.bytes.byteLength;
	}
	encodeInto(value: void, dataView: DataView): void {
		const dst = new Uint8Array(dataView.buffer, dataView.byteOffset, this.bytes.byteLength);
		dst.set(this.bytes);
	}
	decodeFrom(dataView: DataView): [value: void, advance: number] {
		const data = new Uint8Array(dataView.buffer, dataView.byteOffset, this.bytes.byteLength);
		for (const [i, byte] of this.bytes.entries()) {
			if (data[i] !== byte) {
				throw new Error(`Expected literal bytes ${bytesStr(this.bytes)} but received ${bytesStr(data)}, which differs at index ${i}.`);
			}
		}
		return [void 0, this.bytes.byteLength];
	}
}

/**
 * Format: `[discriminator: u16] [bytes]`
 * 
 * Note: There is a maximum of 65536 members in the union.
 */
export class BFDiscriminatedUnion<
	/** Discriminator key */
	K extends PropertyKey,
	/** Formats */
	const F extends [unknown, BinaryFormat<{ [k in K]: unknown }>][],
> extends BFBase<Infer<F[number][1]>> {
	readonly discriminatorFormat: BFNumber;
	constructor(
		readonly key: K,
		readonly formats: F,
		discriminatorLittleEndian: boolean,
	) {
		if (formats.length > 0x10000) {
			throw new Error("BFDiscriminatedUnion can have a maximum of 65536 members.");
		}
		super();
		this.discriminatorFormat = uint16(discriminatorLittleEndian);
	}
	protected findEntry(value: F[number][0]) {
		return this.formats.entries().find(([, [val,]]) => val === value);
	}
	protected findEntryOrThrow(value: F[number][0]) {
		const entry = this.findEntry(value);
		if (!entry) {
			throw new TypeError(`No matching format in discriminated union. Key: ${String(this.key)}, Value: ${value}`);
		}
		return entry;
	}
	length(value: Infer<F[number][1]>): number {
		const [i, [, format]] = this.findEntryOrThrow(value[this.key]);
		return this.discriminatorFormat.length(i) + format.length(value);
	}
	encodeInto(value: Infer<F[number][1]>, dataView: DataView): void {
		const [i, [, format]] = this.findEntryOrThrow(value[this.key]);
		const offsetDataView = this.discriminatorFormat.encodeIntoAndAdvance(i, dataView);
		format.encodeInto(value, offsetDataView);
	}
	decodeFrom(dataView: DataView): [value: Infer<F[number][1]>, advance: number] {
		const [i, offsetDataView, iOffset] = this.discriminatorFormat.decodeFromAndAdvance(dataView);
		const entry = this.formats[i];
		if (!entry) throw new Error(`No format at index ${i}.`);
		const [v, format] = entry;
		const [value, advance] = format.decodeFrom(offsetDataView);
		// @ts-expect-error weird
		return [value, advance + iOffset];
	}
}

/**
 * Format: `[a: A] [b: B] ...`
 */
export class BFTuple<F extends readonly BinaryFormat[]> extends BFBase<{ [i in keyof F]: Infer<F[i]>; }> {
	constructor(readonly formats: F) { super(); }
	length(value: { [i in keyof F]: Infer<F[i]>; }): number {
		return this.formats.reduce(
			(length, format, i) => length + format.length(value[i]),
			0
		);
	}
	encodeInto(value: { [i in keyof F]: Infer<F[i]>; }, dataView: DataView): void {
		let offset = 0;
		for (const [i, format] of this.formats.entries()) {
			const item = value[i];
			const offsetDataView = sliceDataView(dataView, offset);
			offset += format.length(item);
			format.encodeInto(value[i], offsetDataView);
		}
	}
	decodeFrom(dataView: DataView): [value: { [i in keyof F]: Infer<F[i]>; }, advance: number] {
		let offset = 0;
		const result = [];
		for (const [i, format] of this.formats.entries()) {
			const offsetDataView = sliceDataView(dataView, offset);
			const [value, advance] = format.decodeFrom(offsetDataView);
			offset += advance;
			result.push(value);

			if (log) console.log("@%s | %f: %o", offsetDataView.byteOffset.toString(16).padStart(4, "0"), i, value);
		}
		return [
			// Evil cast!
			// But result is a tuple, and tuples are always weird
			// I could construct a pair BF, but that could lead to too much nesting
			// @ts-expect-error
			result,
			offset,
		];
	}
}

/**
 * Format: `[length: i32] [bytes: F[length]]`
 * 
 * Note: length refers to the number of items, not the number of bytes.  
 * e.g. an array of 4 `i32`s will have a length of 4, not 16.
 */
export class BFArray<T, F extends BinaryFormat<T>> extends BFBase<T[]> {
	readonly lengthFormat: BFNumber;
	constructor(readonly format: F, lengthLittleEndian: boolean) {
		super();
		this.lengthFormat = int32(lengthLittleEndian);
	}
	length(value: Infer<F>[]): number {
		return this.lengthFormat.length(value.length) + value.reduce((l, v) => l + this.format.length(v), 0);
	}
	encodeInto(value: Infer<F>[], dataView: DataView): void {
		this.lengthFormat.encodeInto(value.length, dataView);
		let offset = this.lengthFormat.length(value.length);
		for (const v of value) {
			const offsetDataView = sliceDataView(dataView, offset);
			this.format.encodeInto(v, offsetDataView);
			offset += this.format.length(v);
		}
	}
	decodeFrom(dataView: DataView): [value: T[], advance: number] {
		const [length, advance] = this.lengthFormat.decodeFrom(dataView);
		let offset = advance;
		const result = new Array<T>(length);
		for (const i of range(length)) {
			const offsetDataView = sliceDataView(dataView, offset);
			const [value, advance] = this.format.decodeFrom(offsetDataView);
			result[i] = value;
			offset += advance;
		}
		return [result, offset];
	}
}

type EntriesToRecordRec<T extends [string, unknown][]> =
	T extends [infer T0 extends [string, unknown], ...infer T_ extends [string, unknown][]]
	? { [k in T0[0]]: T0[1] } & EntriesToRecordRec<T_>
	: {};
type EntriesToRecord<T extends [string, unknown][]> = EntriesToRecordRec<T>;
type InferValues<T> = { [k in keyof T]: Infer<T[k]>; };
type ObjectType<T extends [string, unknown][]> = Realize<InferValues<EntriesToRecord<T>>>;
export class BFObject<const T extends [string, BinaryFormat][]> extends BFBase<ObjectType<T>> {
	constructor(readonly formats: T) {
		super();
	}
	length(value: ObjectType<T>): number {
		let length = 0;
		for (const [key, format] of this.formats) {
			const len = format.length(value[key as keyof typeof value]);
			length += len;
		}
		return length;
	}
	encodeInto(value: ObjectType<T>, dataView: DataView): void {
		let offset = 0;
		for (const [key, format] of this.formats) {
			try {
				const v = value[key as keyof typeof value];
				const offsetDataView = sliceDataView(dataView, offset);
				const length = format.length(v);
				offset += length;
				format.encodeInto(v, offsetDataView);
			} catch (err) {
				throw new BFError(
					`Error while encoding object key "${key}":`,
					dataView.byteOffset + offset,
					{ cause: err }
				);
			}
		}
	}
	decodeFrom(dataView: DataView): [value: ObjectType<T>, advance: number] {
		let offset = 0;
		const result: Record<string, unknown> = {};
		for (const [key, format] of this.formats) {
			try {
				const offsetDataView = sliceDataView(dataView, offset);
				const [value, advance] = format.decodeFrom(offsetDataView);
				offset += advance;
				result[key] = value;

				if (log) console.log("@%s | %s: %o", offsetDataView.byteOffset.toString(16).padStart(4, "0"), key, value);
			} catch (err) {
				throw new BFError(
					`Error while decoding object key "${key}":`,
					dataView.byteOffset + offset,
					{ cause: err }
				);
			}
		}
		return [
			// @ts-expect-error I could probably do this with some recursive stuff but whatever
			result,
			offset,
		];
	}

	/** Add additional properties to a `BFObject`. */
	extend<const F extends [string, BinaryFormat][]>(extraFormats: F): BFObject<[...T, ...F]> {
		return new BFObject([...this.formats, ...extraFormats]);
	}
}

/**
 * Format: `[bytes]`
 */
export class BFBytes extends BFBase<ArrayBufferLike> {
	constructor(readonly count: number) { super(); }
	length(value: ArrayBufferLike): number {
		return this.count;
	}
	encodeInto(value: ArrayBufferLike, dataView: DataView): void {
		if (value.byteLength !== this.count) {
			throw new RangeError(`Expected an ArrayBufferLike with length ${this.count}, but received ${value.byteLength}`);
		}
		const dst = new Uint8Array(dataView.buffer, dataView.byteOffset, this.count);
		const src = new Uint8Array(value);
		dst.set(src);
	}
	decodeFrom(dataView: DataView): [value: ArrayBufferLike, advance: number] {
		const buffer = dataView.buffer.slice(dataView.byteOffset, this.count);
		return [buffer, this.count];
	}
}

/**
 * Format: `[bool: byte]`
 * 
 * Note: Booleans are encoded as 1-byte values, with `0x01` as `true` and `0x00` as `false`
 */
export class BFBoolean extends BFBase<boolean> {
	length(value: boolean): number { return 1; }
	encodeInto(value: boolean, dataView: DataView): void {
		dataView.setUint8(0, +value);
	}
	decodeFrom(dataView: DataView): [value: boolean, advance: number] {
		return [dataView.getUint8(0) !== 0, 1];
	}
}

type DataViewNumberGetter = (
	| "getUint8" | "getUint16" | "getUint32"
	| "getInt8" | "getInt16" | "getInt32"
	| "getFloat16" | "getFloat32" | "getFloat64"
);
type DataViewNumberSetter = (
	| "setUint8" | "setUint16" | "setUint32"
	| "setInt8" | "setInt16" | "setInt32"
	| "setFloat16" | "setFloat32" | "setFloat64"
);
export class BFNumber extends BFBase<number> {
	constructor(
		readonly bytes: number,
		readonly getter: DataViewNumberGetter,
		readonly setter: DataViewNumberSetter,
		readonly littleEndian: boolean,
	) { super(); }

	length(value: number): number {
		return this.bytes;
	}
	encodeInto(value: number, dataView: DataView): void {
		dataView[this.setter](0, value, this.littleEndian);
	}
	decodeFrom(dataView: DataView): [value: number, advance: number] {
		const value = dataView[this.getter](0, this.littleEndian);
		return [value, this.bytes];
	}
}

type DataViewBigIntGetter = (
	| "getBigInt64" | "getBigUint64"
);
type DataViewBigIntSetter = (
	| "setBigInt64" | "setBigUint64"
);
export class BFBigInt extends BFBase<bigint> {
	readonly bytes = 8;
	constructor(
		readonly getter: DataViewBigIntGetter,
		readonly setter: DataViewBigIntSetter,
		readonly littleEndian: boolean,
	) { super(); }

	length(value: bigint): number {
		return this.bytes;
	}
	encodeInto(value: bigint, dataView: DataView): void {
		dataView[this.setter](0, value, this.littleEndian);
	}
	decodeFrom(dataView: DataView): [value: bigint, advance: number] {
		const value = dataView[this.getter](0, this.littleEndian);
		return [value, this.bytes];
	}
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
/** 
 * Format: `[length: i32] [bytes: byte[length]]`
 * 
 * Note: length is the number of bytes, not string length. Strings are in UTF-8.
 */
export class BFString extends BFBase<string> {
	readonly lengthFormat: BFNumber;
	constructor(lengthLittleEndian: boolean) {
		super();
		this.lengthFormat = int32(lengthLittleEndian);
	}

	length(value: string): number {
		const strBytes = encoder.encode(value).length;
		const length = this.lengthFormat.length(strBytes) + strBytes;
		return length;
	}
	encodeInto(value: string, dataView: DataView): void {
		const bytes = encoder.encode(value).length;
		const offset = this.lengthFormat.length(bytes);
		try {
			const length = this.length(value);
			this.lengthFormat.encodeInto(bytes, dataView);
			const array = new Uint8Array(dataView.buffer, dataView.byteOffset + offset, bytes);
			encoder.encodeInto(value, array);
		} catch (err) {
			throw new BFError(
				`Error encoding string with length ${bytes}`,
				dataView.byteOffset,
				{ cause: err }
			);
		}
	}
	decodeFrom(dataView: DataView): [value: string, advance: number] {
		const [length, offset] = this.lengthFormat.decodeFrom(dataView);
		try {
			const offsetDataView = sliceDataView(dataView, offset, length);
			const str = decoder.decode(offsetDataView);
			return [str, offset + length];
		} catch (err) {
			throw new BFError(
				`Error decoding string with length ${length}`,
				dataView.byteOffset,
				{ cause: err }
			);
		}
	}
}

