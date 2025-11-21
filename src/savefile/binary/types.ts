import { Realize } from "@common/types.ts";
import { BinaryFormat, sliceDataView } from "./defs.ts";
import { range } from "@common/array.ts";
import { int32 } from "./index.ts";

export type Infer<T> = T extends BinaryFormat<infer U> ? U : never;

export abstract class BFBase<T> implements BinaryFormat<T> {
	abstract length(value: T): number;
	abstract encodeInto(value: T, dataView: DataView): void;
	abstract decodeFrom(dataView: DataView): { value: T; advance: number; };

	encode(value: T): ArrayBuffer {
		const size = this.length(value);
		const buffer = new ArrayBuffer(size);
		const dataView = new DataView(buffer);
		this.encodeInto(value, dataView);
		return buffer;
	}
	decode(buffer: ArrayBuffer): T {
		const dataView = new DataView(buffer);
		const { value, advance } = this.decodeFrom(dataView);
		if (advance > buffer.byteLength) {
			console.warn(
				"Did not consume entire buffer when decoding (%i/%i).",
				advance, buffer.byteLength,
			);
		}
		return value;
	}
}

export class BFTransform<T, U, B extends BinaryFormat<U>> extends BFBase<T> {
	constructor(
		readonly base: B,
		readonly transformEncode: (value: T) => U,
		readonly transformDecode: (value: U) => T,
	) { super(); }
	length(value: T): number {
		return this.base.length(this.transformEncode(value));
	}
	encodeInto(value: T, dataView: DataView): void {
		this.base.encodeInto(this.transformEncode(value), dataView);
	}
	decodeFrom(dataView: DataView): { value: T; advance: number; } {
		const { value, advance } = this.base.decodeFrom(dataView);
		return {
			value: this.transformDecode(value),
			advance,
		};
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
	decodeFrom(dataView: DataView): { value: { [i in keyof F]: Infer<F[i]>; }; advance: number; } {
		let offset = 0;
		const result = [];
		for (const format of this.formats) {
			const offsetDataView = sliceDataView(dataView, offset);
			const { value, advance } = format.decodeFrom(offsetDataView);
			offset += advance;
			result.push(value);
		}
		return {
			// Evil cast!
			// But result is a tuple, so that's always weird
			// I could construct a pair BF, but that could lead to too much nesting
			value: result as { [i in keyof F]: Infer<F[i]>; },
			advance: offset,
		};
	}
}

/**
 * Format: `[length: i32] [...bytes: F[length]]`
 * 
 * Note: length refers to the number of items, not the number of bytes.  
 * e.g. an array of 4 `i32`s will have a length of 4, not 16.
 */
export class BFArray<T, F extends BinaryFormat<T>> extends BFBase<T[]> {
	readonly lengthFormat: BFNumber;
	constructor(readonly format: F, lengthLittleEndian: boolean) {
		super();
		this.lengthFormat = new BFNumber(
			4,
			"getInt32",
			"setInt32",
			lengthLittleEndian,
		);
	}
	length(value: Infer<F>[]): number {
		return this.lengthFormat.length(value.length) + value.reduce((l, v) => l + this.format.length(v), 0);
	}
	encodeInto(value: Infer<F>[], dataView: DataView): void {
		this.lengthFormat.encodeInto(value.length, dataView);
		let offset = 1;
		for (const v of value) {
			const offsetDataView = sliceDataView(dataView, offset);
			offset += this.format.length(v);
			this.format.encodeInto(v, offsetDataView);
		}
	}
	decodeFrom(dataView: DataView): { value: T[]; advance: number; } {
		const { value: length, advance } = this.lengthFormat.decodeFrom(dataView);
		let offset = advance;
		const result = new Array<T>(length);
		for (const i of range(length)) {
			const offsetDataView = sliceDataView(dataView, offset);
			const { value, advance } = this.format.decodeFrom(offsetDataView);
			result[i] = value;
			offset += advance;
		}
		return {
			value: result,
			advance: offset,
		};
	}
}

type EntriesToRecordRec<T extends [string, unknown][]> =
	T extends [infer T0 extends [string, unknown], ...infer T_ extends [string, unknown][]]
	? { [k in T0[0]]: T0[1] } & EntriesToRecordRec<T_>
	: {};
type EntriesToRecord<T extends [string, unknown][]> = Realize<EntriesToRecordRec<T>>;
type InferValues<T> = { [k in keyof T]: Infer<T[k]>; };
type ObjectType<T extends [string, unknown][]> = InferValues<EntriesToRecord<T>>;
export class BFObject<T extends [string, BinaryFormat][]> extends BFBase<ObjectType<T>> {
	constructor(readonly formats: T) {
		super();
	}
	length(value: ObjectType<T>): number {
		let length = 0;
		for (const [key, format] of this.formats) {
			length += format.length(value[key as keyof typeof value]);
		}
		return length;
	}
	encodeInto(value: ObjectType<T>, dataView: DataView): void {
		let offset = 0;
		for (const [key, format] of this.formats) {
			const v = value[key as keyof typeof value];
			const offsetDataView = sliceDataView(dataView, offset);
			offset += format.length(v);
			format.encodeInto(v, offsetDataView);
		}
	}
	decodeFrom(dataView: DataView): { value: ObjectType<T>; advance: number; } {
		let offset = 0;
		const result: Record<string, unknown> = {};
		for (const [key, format] of this.formats) {
			const offsetDataView = sliceDataView(dataView, offset);
			const { value, advance } = format.decodeFrom(offsetDataView);
			offset += advance;
			result[key] = value;
		}
		return {
			// Uh oh! scary cast!
			value: result as never,
			advance: offset,
		};
	}
}

export class BFBytes extends BFBase<ArrayBufferLike> {
	constructor(readonly count: number) { super(); }
	length(value?: ArrayBufferLike): number {
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
	decodeFrom(dataView: DataView): { value: ArrayBufferLike; advance: number; } {
		const buffer = dataView.buffer.slice(dataView.byteOffset, this.count);
		return {
			value: buffer,
			advance: this.count,
		};
	}
}

/**
 * Format: `[bool: byte]`
 * 
 * Booleans are encoded as 1-byte values, with `0x01` as `true` and `0x00` as `false`
 */
export class BFBoolean extends BFBase<boolean> {
	length(value?: boolean): number { return 1; }
	encodeInto(value: boolean, dataView: DataView): void {
		dataView.setUint8(0, +value);
	}
	decodeFrom(dataView: DataView): { value: boolean; advance: number; } {
		return {
			value: dataView.getUint8(0) !== 0,
			advance: 1,
		};
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

	length(value?: number): number {
		return this.bytes;
	}
	encodeInto(value: number, dataView: DataView): void {
		dataView[this.setter](0, value, this.littleEndian);
	}
	decodeFrom(dataView: DataView): { value: number; advance: number; } {
		const value = dataView[this.getter](0, this.littleEndian);
		return { value, advance: this.bytes };
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

	length(value?: bigint): number {
		return this.bytes;
	}
	encodeInto(value: bigint, dataView: DataView): void {
		dataView[this.setter](0, value, this.littleEndian);
	}
	decodeFrom(dataView: DataView): { value: bigint; advance: number; } {
		const value = dataView[this.getter](0, this.littleEndian);
		return { value, advance: this.bytes };
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
		const bytes = encoder.encode(value).length;
		return this.lengthFormat.length(bytes) + bytes;
	}
	encodeInto(value: string, dataView: DataView): void {
		const bytes = encoder.encode(value).length;
		const offset = this.lengthFormat.length(bytes);
		this.lengthFormat.encodeInto(bytes, dataView);
		const array = new Uint8Array(dataView.buffer, dataView.byteOffset + offset, bytes);
		encoder.encodeInto(value, array);
	}
	decodeFrom(dataView: DataView): { value: string; advance: number; } {
		const { value: length, advance: offset } = this.lengthFormat.decodeFrom(dataView);
		const offsetDataView = sliceDataView(dataView, offset, length);
		const str = decoder.decode(offsetDataView);
		return {
			value: str,
			advance: offset + length,
		};
	}
}