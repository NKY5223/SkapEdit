import { bitsStr, bufferStr } from "./utils.ts";

const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
const padding = `=`;

const reverseCharMap = (char: string) => {
	// Treat `=` as 000000
	if (char === padding) return 0;
	const index = chars.indexOf(char);
	if (index < 0) throw new Error(`Unknown base64 character "${char}".`);
	return index;
}

// Uint8Array#toBase64 is a thing, but it's newly baseline

export const bufferToBase64 = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer);
	let str = "";
	for (let i = 0; i < bytes.byteLength; i += 3) {
		const byte0 = bytes[i + 0] ?? 0;
		const byte1 = bytes[i + 1] ?? 0;
		const byte2 = bytes[i + 2] ?? 0;

		const part0 =
			(byte0 & 0b11111100) >> 2;
		const part1 =
			(byte0 & 0b00000011) << 4 |
			(byte1 & 0b11110000) >> 4;
		const part2 =
			(byte1 & 0b00001111) << 2 |
			(byte2 & 0b11000000) >> 6;
		const part3 =
			(byte2 & 0b00111111) << 0;
		
		const trailing = i + 3 >= bytes.byteLength ? bytes.byteLength % 3 : 0;
		str += chars[part0];
		str += chars[part1];
		if (trailing === 1) {
			str += padding;
			str += padding;
			continue;
		}
		str += chars[part2];
		if (trailing === 2) {
			str += padding;
			continue;
		}
		str += chars[part3];
	}

	return str;
}
export const base64ToBuffer = (str: string): ArrayBuffer => {
	const bytes = [];
	for (let i = 0; i < str.length; i += 4) {
		const char0 = str[i + 0] ?? padding;
		const char1 = str[i + 1] ?? padding;
		const char2 = str[i + 2] ?? padding;
		const char3 = str[i + 3] ?? padding;

		const part0 = reverseCharMap(char0);
		const part1 = reverseCharMap(char1);
		const part2 = reverseCharMap(char2);
		const part3 = reverseCharMap(char3);
		

		const byte0 =
			(part0 & 0b111111) << 2 |
			(part1 & 0b110000) >> 4;
		const byte1 =
			(part1 & 0b001111) << 4 |
			(part2 & 0b111100) >> 2;
		const byte2 =
			(part2 & 0b000011) << 6 |
			(part3 & 0b111111) >> 0;

		bytes.push(byte0);
		if (char2 === padding) continue;
		bytes.push(byte1);
		if (char3 === padding) continue;
		bytes.push(byte2);
	}
	return new Uint8Array(bytes).buffer;
}

// const buffer = new TextEncoder().encode("Testung910h1jdn nzxc.").buffer;
// const b64 = bufferToBase64(buffer);
// const decoded = base64ToBuffer(b64);

// console.log("buffer", bufferStr(buffer));
// console.log("b64", b64);
// console.log("decoded", bufferStr(decoded));
