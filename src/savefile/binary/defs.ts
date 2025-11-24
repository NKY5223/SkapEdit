import { range } from "@common/array.ts";

export interface BinaryFormat<T = unknown> {
	/** Size of a value in bytes */
	length(value: T): number;
	encodeInto(value: T, dataView: DataView): void;
	decodeFrom(dataView: DataView): [
		/** The value decoded from the binary data. */
		value: T,
		/** Number of bytes to advance the index by. */
		advance: number,
	];

	encode(value: T): ArrayBuffer;
	decode(buffer: ArrayBuffer): T;
};
export const sliceDataView = <T extends ArrayBufferLike>(dataView: DataView<T>, offset: number, length?: number): DataView<T> => {
	return new DataView(dataView.buffer, offset + dataView.byteOffset, length);
}

export const byteStr = (byte: number) => byte.toString(16).padStart(2, "0");
type DataViewStrOptions = {
	maxLength?: number;
};
export const dataViewStr = (dataView: DataView, options?: DataViewStrOptions): string => {
	const {
		maxLength = 32,
	} = options ?? {};

	const { byteOffset, byteLength } = dataView;
	const extend = new DataView(dataView.buffer);
	const head = byteOffset > 1 ? `⋯ ` : ``;
	const left = byteOffset > 0
		? `${head}${byteStr(extend.getUint8(byteOffset))} ⟨`
		: `⟨`;
	const end = byteOffset + byteLength;
	const tail = end < extend.byteLength - 1 ? ` ⋯` : ``;
	const right = end < extend.byteLength
		? `⟩ ${byteStr(extend.getUint8(byteOffset))}${tail}`
		: `⟩`;

	if (byteLength > maxLength) {
		const half = Math.ceil(maxLength / 2);
		const first = range(half)
			.map(i => dataView.getUint8(i))
			.map(byteStr).join(" ");
		const second = range(byteLength, byteLength - half)
			.map(i => dataView.getUint8(i))
			.map(byteStr).join(" ");

		return `${left}${first} ⋯ ${second}${right}`;
	}
	const bytes = range(byteLength)
		.map(i => dataView.getUint8(i))
		.map(byteStr).join(" ");
	return `${left}${bytes}${right}`;
}

