const canvas = new OffscreenCanvas(100, 100);
const ctx = canvas.getContext("2d");
const cache = new Map<string, Map<string, number>>();
export const strWidth = (str: string, font: string = "monospace") => {
	const fontCache = cache.get(font) ?? (() => {
		const map = new Map<string, number>();
		cache.set(font, map);
		return map;
	})();
	const cached = fontCache.get(str);
	if (cached !== undefined) return cached;

	if (!ctx) {
		console.error("no ctx??");
		return 0;
	}
	ctx.font = `1px ${font}`;
	const measure = ctx.measureText(str);
	const width = measure.width;

	fontCache.set(str, width);
	return width;
}

// const descChar = (char: string) => `U+${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
// const desc = (str: string) => [...str].map(c => descChar(c)).join(" ");

// const font = '"Russo One"';
// const chars = [
// 	" ", "\u28ff", "\u2800",
// 	"\u2000", "\u2001", "\u2002", "\u2003",
// 	"\u2004", "\u2005", "\u2006", "\u2007",
// 	"\u2008", "\u2009", "\u200a",
// 	"\u28ff\u2006\u2006\u28ff\u2006\u2006",
// 	"\u28ff\u2006\u2006",
// ];
// console.table(chars.map(s => ({
// 	desc: desc(s),
// 	s,
// 	width: strWidth(s, font),
// })));

// type Result = {
// 	str: string;
// 	width: number;
// };
// const widthCombos = (targetWidth: number, strs: readonly string[], font: string = "monospace", acc: string = ""): Result[] => {
// 	if (targetWidth < 0) return [];
// 	if (acc.length > 3) return [{
// 		str: acc + " EARLY_EXIT",
// 		width: strWidth(acc, font),
// 	}];
// 	const results: Result[] = unique(strs.flatMap<Result>(str => {
// 		const newStr = acc + str;
// 		if (strWidth(str) === 0) {
// 			console.error("Cannot proceed with width-0 str:", JSON.stringify(str));
// 			return {
// 				str: "ERROR",
// 				width: -Infinity,
// 			};
// 		}
// 		const width = strWidth(newStr, font);
// 		if (width >= targetWidth) {
// 			// console.log("gteq:", desc(newStr), width, targetWidth);
// 			return {
// 				str: newStr,
// 				width,
// 			};
// 		}
// 		// potentially infinitely recursive?
// 		return widthCombos(targetWidth, strs, font, newStr);
// 	}), (a, b) => a.str === b.str);

// 	return results;
// }
// const findBests = (target: string, strs: readonly string[], font: string = "monospace") => {
// 	const targetWidth = strWidth(target, font);
// 	const results = widthCombos(
// 		targetWidth,
// 		strs,
// 		font
// 	);

// 	results.sort((a, b) =>
// 		(a.width - targetWidth) ** 2 -
// 		(b.width - targetWidth) ** 2
// 	);

// 	console.log("target:", targetWidth);
// 	console.table(results.slice(0, 50).map(result => ({
// 		desc: desc(result.str),
// 		str: result.str,
// 		width: result.width,
// 		diff: result.width - targetWidth,
// 	})));
// }
// findBests("\u28ff\u2006\u2006", chars.filter(c => c.length === 1 && c !== "\u28ff"), font);