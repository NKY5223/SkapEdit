import { range } from "@common/array.ts";

export const sliceDataView = <T extends ArrayBufferLike>(dataView: DataView<T>, offset: number, length?: number): DataView<T> => {
	return new DataView(dataView.buffer, offset + dataView.byteOffset, length);
}

export const bitsStr = (byte: number) => byte.toString(2).padStart(8, "0");
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

export const bytesStr = (bytes: Uint8Array): string => {
	return `⟨${bytes.values().map(byte => byte.toString(16).padStart(2, "0")).toArray().join(" ")}⟩`;
}
export const bufferStr = (buffer: ArrayBuffer) => bytesStr(new Uint8Array(buffer));