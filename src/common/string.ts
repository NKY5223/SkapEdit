import { analyseStack } from "./error.ts";
import { transpose } from "./array.ts";
import { Matrix, Vector } from "./vector.ts";

export const indent = (str: string, char = "\t") => str.split("\n").map(s => char + s).join("\n");

export type NormTextBlock = {
	lines: string[];
	// Where to place this block in relation to others
	anchor: number;
};
export type TextBlock = (
	// A 1-line block; SHOULD NOT contain newlines unless wrapped in normalize
	| string
	// Multiline block
	| string[]
	| NormTextBlock
);
type StringifierReturn = TextBlock | false | null | undefined;
type Stringifier<T extends unknown[] = []> = (x: unknown, str: (x: unknown) => NormTextBlock, ...args: T) => StringifierReturn;

type TypesetOptions = {
	stringifiers: Stringifier<[]>[];
};

export const isTextBlock = (x: unknown): x is NormTextBlock =>
	typeof x === "object" &&
	x !== null &&
	"anchor" in x &&
	typeof x.anchor === "number" &&
	Number.isInteger(x.anchor) &&
	"lines" in x &&
	Array.isArray(x.lines) &&
	x.lines.length >= 1 &&
	x.lines.every(s => typeof s === "string")
	;
export const stringifyWith = (stringifiers: Stringifier[]) => {
	const str = (value: unknown): NormTextBlock => isTextBlock(value) ? value : normalize(
		stringifiers
			.map(f => f(value, str))
			.find(x => x !== undefined && x !== false && x !== null)
		?? String(value)
	);
	return str;
}

export const typeset = (options: Partial<TypesetOptions>) => {
	return (template: readonly string[], ...substs: (NormTextBlock | unknown)[]): string => {
		const { stringifiers } = options;
		const parts: NormTextBlock[] = [];
		const result: string[] = [];

		const subst = substs.map(stringifyWith(stringifiers ?? []));

		const flushParts = () => {
			if (parts.length === 0) {
				result.push("");
				return;
			}
			const info = parts.map(block => ({
				block,
				measure: measure(block),
			}));
			const measures = info.map(({ measure }) => measure);
			const top = Math.max(0, ...measures.map(({ above }) => above));
			const bottom = Math.max(0, ...measures.map(({ below }) => below));

			result.push(...transpose(info.map(({ block, measure }) => [
				...new Array<string>(top - measure.above).fill(measure.widthStr),
				...block.lines,
				...new Array<string>(bottom - measure.below).fill(measure.widthStr),
			])).map(s => s.join("")));

			parts.length = 0;
		}

		for (const [i, str] of template.entries()) {
			const lines = str.split("\n");
			if (lines.length === 1) {
				if (i in subst) {
					// Keep going until \n found
					parts.push(normalize(str), subst[i]);
					continue;
				} else {
					// End
					parts.push(normalize(str));
					flushParts();
					break;
				}
			} else {
				// \n Found
				const first = lines.shift();
				if (first === undefined) throw new Error("Unreachable??");
				const last = lines.pop();
				if (last === undefined) throw new Error("Unreachable??");

				// Complete current line
				parts.push(normalize(first));
				flushParts();
				// Push lines in
				result.push(...lines);
				// Next line
				if (i in subst) {
					parts.push(normalize(last), subst[i]);
					flushParts();
					continue;
				} else {
					// End
					parts.push(normalize(last));
					flushParts();
					break;
				}
			}
		}

		return result.join("\n");
	};
}

// #region Brackets
/**
 * All properties should be the same length to avoid offsetting
 */
type BracketConfig = {
	/** e.g. `⎧` */
	top: string;
	/** e.g. `⎪` */
	extend: string;
	/** e.g. `⎩` */
	bottom: string;
	/** e.g. `{` */
	short: string;
	/**
	 * For anchor
	 */
	anchor?: {
		/** e.g. `⎨` */
		anchor: string;
		/** e.g. merged top & anchor characters */
		anchorTop?: string;
		anchorBottom?: string;
	};
	/** For two-high blocks */
	two?: {
		/** e.g. `⎰` */
		top: string;
		/** e.g. `⎱` */
		bottom: string;
	};
};
const singleBracket = (config: BracketConfig) => (block: TextBlock): NormTextBlock => {
	const norm = normalize(block);
	const { above, below, height } = measure(norm);

	if (height === 1) {
		const { short } = config;
		return {
			lines: [
				short
			],
			anchor: norm.anchor,
		};
	}
	if (height === 2) {
		const { two } = config;
		if (two) {
			const { top, bottom } = two;
			return {
				lines: [
					top,
					bottom,
				],
				anchor: norm.anchor,
			}
		}
	}

	const { top, extend, bottom } = config;
	if (config.anchor) {
		const { anchor, anchorBottom = anchor, anchorTop = anchor } = config.anchor;
		const upper = above === 0 ? [anchorTop] : [
			top,
			...new Array<string>(above - 1).fill(extend),
		];
		const lower = below === 0 ? [anchorBottom] : [
			...new Array<string>(below - 1).fill(extend),
			bottom,
		];
		const middle = above === 0 || below === 0 ? [] : [anchor];
		return {
			lines: [
				...upper,
				...middle,
				...lower,
			],
			anchor: norm.anchor,
		};
	}
	return {
		lines: [
			top,
			...new Array<string>(height - 2).fill(extend),
			bottom,
		],
		anchor: norm.anchor,
	};
}
export const brackets = (left: BracketConfig, right: BracketConfig) => {
	const leftBrack = singleBracket(left);
	const rightBrack = singleBracket(right);
	return (block: TextBlock): NormTextBlock => {
		const norm = normalize(block);
		const l = leftBrack(block);
		const r = rightBrack(block);
		return concat(l, norm, r);
	};
}
export const bracketPresets = {
	square: brackets({
		top: "⎡",
		extend: "⎢",
		bottom: "⎣",
		short: "[",
	}, {
		top: "⎤",
		extend: "⎥",
		bottom: "⎦",
		short: "]",
	}),
	curly: brackets({
		top: "⎧",
		extend: "⎪",
		anchor: {
			anchor: "⎨"
		},
		bottom: "⎩",
		short: "{",
		two: {
			top: "⎰",
			bottom: "⎱",
		},
	}, {
		top: "⎫",
		extend: "⎪",
		anchor: {
			anchor: "⎬"
		},
		bottom: "⎭",
		short: "}",
		two: {
			top: "⎱",
			bottom: "⎰",
		},
	}),
	straight: brackets({
		top: "|",
		extend: "|",
		bottom: "|",
		short: "|",
	}, {
		top: "|",
		extend: "|",
		bottom: "|",
		short: "|",
	}),
}
// #endregion

// #region Align
type AlignV = "top" | "middle" | "bottom";
type AlignH = "left" | "middle" | "right";
type Align = "start" | "middle" | "end";
const alignVerticalMap = new Map<AlignV, Align>([
	["top", "start"],
	["middle", "middle"],
	["bottom", "end"]
]);
const alignHorizontalMap = new Map<AlignH, Align>([
	["left", "start"],
	["middle", "middle"],
	["right", "end"]
]);
const aV = (s: AlignV) => alignVerticalMap.get(s)!;
const aH = (s: AlignH) => alignHorizontalMap.get(s)!;

export const alignV = (align: AlignV = "middle", strs: readonly string[]) => {
	const totalHeight = Math.max(...strs.map(s => measure(s).height));
	const lines: string[][] = Array.from({ length: totalHeight }, () => []);
	for (const str of strs) {
		const { height, widthStr } = measure(str);
		const [top, bottom] = distribute(aV(align), totalHeight, height);
		[
			...new Array(top).fill(widthStr),
			...str.split("\n"),
			...new Array(bottom).fill(widthStr),
		].forEach((s, i) => lines[i].push(s));
	}
	return lines.map(l => l.join("")).join("\n");
}
type AlignHOptions = AlignH | {
	/** 
	 * Substring to align everything at. Strings without this substring are  
	 * placed to one side according to {@linkcode AlignHOptions["align"]}
	 */
	alignAt: string;
	/**
	 * If `"left"`, Strings are placed to the left, e.g.
	 * ```txt
	 * example|text
	 *    left|
	 *        |right
	 *    none
	 * ```
	 * If `"right"`, Strings are placed to the right, e.g.
	 * ```txt
	 * example|text
	 *    left|
	 *        |right
	 *         none
	 * ```
	 */
	align: "left" | "right";
};
export const alignH = (options: AlignHOptions = "middle", strs: readonly string[]): string[] => {
	if (typeof options === "string") {
		const totalWidth = Math.max(0, ...strs.map(str => measure(str).width));
		return strs.map(str => {
			const { width } = measure(str);
			const [left, right] = distribute(aH(options), totalWidth, width);
			return `${" ".repeat(left)}${str}${" ".repeat(right)}`;
		});
	}
	const { alignAt, align } = options;
	const infos = strs.map(str => {
		const index = str.indexOf(alignAt);
		if (index === -1) {
			switch (align) {
				case "left":
					return {
						str,
						index,
						left: str.length,
						right: -1,
					};
				case "right":
					return {
						str,
						index,
						left: -1,
						right: str.length,
					};
			}
		}
		const left = index;
		const right = str.length - index - 1;
		return {
			str,
			index,
			left, right,
		};
	});
	const left = Math.max(0, ...infos.map(({ left }) => left));
	const right = Math.max(0, ...infos.map(({ right }) => right));
	if (infos.every(({ index }) => index === -1)) {
		switch (align) {
			case "left":
				return infos.map(info =>
					`${" ".repeat(left - info.left)}${info.str}${" ".repeat(right)}`
				);
			case "right":
				return infos.map(info =>
					`${" ".repeat(left)}${info.str}${" ".repeat(right - info.right)}`
				);
		}
	}
	return infos.map(info =>
		`${" ".repeat(left - info.left)}${info.str}${" ".repeat(right - info.right)}`
	);
}

const distribute = (align: Align, space: number, size: number): [start: number, end: number] => {
	const diff = space - size;
	switch (align) {
		case "start": {
			return [0, diff];
		}
		case "middle": {
			const ceil = Math.ceil(diff / 2);
			const floor = Math.floor(diff / 2);
			return [floor, ceil];
		}
		case "end": {
			return [diff, 0];
		}
	}
}
// #endregion

/**
 * Concatenates TextBlocks horizontally.
 */
export const concat = (...blocks: TextBlock[]): NormTextBlock => {
	if (blocks.length === 0) return {
		lines: [""],
		anchor: 0,
	}

	const info = blocks.map(block => ({
		block: normalize(block),
		measure: measure(block),
	}));
	const measures = info.map(({ measure }) => measure);
	const top = Math.max(0, ...measures.map(({ above }) => above));
	const bottom = Math.max(0, ...measures.map(({ below }) => below));

	const lines = transpose(info.map(({ block, measure }) => [
		...new Array<string>(top - measure.above).fill(measure.widthStr),
		...block.lines,
		...new Array<string>(bottom - measure.below).fill(measure.widthStr),
	])).map(s => s.join(""));

	const anchor = top - info[0].measure.above + info[0].block.anchor;
	return {
		lines,
		anchor,
	};
};

/**
 * Concatenates TextBlocks vertically.
 */
export const append = (...blocks: TextBlock[]): NormTextBlock => {
	if (blocks.length === 0) return {
		lines: [""],
		anchor: 0,
	};

	const lines = blocks.flatMap(b => normalize(b).lines);
	return {
		lines,
		anchor: 0,
	};
}

export const normalize = (block: TextBlock): NormTextBlock => {
	if (typeof block === "string") {
		// ts whining (why doesn't split just return [string, ...string[]])
		const [first, ...rest] = block.split("\n");
		return normalize([first, ...rest]);
	}
	if (Array.isArray(block)) {
		if (block.length === 0) throw new Error(`Array TextBlocks cannot be empty`);
		const anchor = Math.floor((block.length - 1) / 2);
		return {
			lines: block,
			anchor,
		};
	}
	return block;
}

type TextMeasure = {
	width: number;
	height: number;
	/** How many lines above anchor is required. Is 0 for single-line strings. */
	above: number;
	/** How many lines below anchor is required. Is 0 for single-line strings. */
	below: number;

	/** A whitespace string with the same width as the block (including tabs) */
	widthStr: string;
};
const measure = (block: TextBlock): TextMeasure => {
	const { lines, anchor } = normalize(block);
	const width = Math.max(0, ...lines.map(s => [...s].length));
	const height = lines.length;

	const above = anchor;
	const below = height - anchor - 1;

	const widthStr = lines[0].replaceAll(/[^\t]/g, " ");

	return {
		width, height,
		above, below,
		widthStr,
	};
}

export const t = typeset({
	stringifiers: [
		// number
		x => {
			if (typeof x !== "number") return;
			if (Object.is(x, Infinity)) return `∞`;
			if (Object.is(x, -Infinity)) return `-∞`;
			if (Object.is(x, NaN)) return `NaN`;

			let str = x.toString();
			if (str.includes("e")) return str;
			const [a, b] = str.split(".");
			if (!b) return str;
			return `${a}.${b.slice(0, 5)}`;
		},
		// // string
		// x => {
		// 	if (typeof x !== "string") return;
		// 	return JSON.stringify(x);
		// },
		x => x instanceof Vector && x.toText(),
		x => x instanceof Matrix && x.toText(),
		// record
		(x, s) => {
			if (typeof x !== "object") return;
			if (x === null) return;
			if (![null, Object.prototype].includes(Object.getPrototypeOf(x))) return;
			const [first, ...rest] = Object.entries(x).flatMap(([k, v], i, a) => [
				JSON.stringify(k),
				": ",
				s(v),
				...(i === a.length - 1 ? [] : [", "])
			]);
			if (!first) return bracketPresets.curly("");
			return bracketPresets.curly(concat(...[first, ...rest]));
		},
		// error
		(x, s) => {
			if (!(x instanceof Error)) return;
			const { name, message, cause, stack } = x;
			const msg = stack
				? analyseStack(x)
				: t`Uncaught ${name}: ${message}`;

			if (cause === undefined) {
				return msg;
			}
			if (cause === null) {
				return t`${msg}\nCause: null`;
			}
			if (Array.isArray(cause)) {
				return append(
					t`${msg}\nCauses:`,
					...cause.flatMap((v, i) =>
						[
							`╡${i}╞${"═".repeat(24 - i.toString().length)}`,
							t`\t${s(v)}`,
						]
					)
				);
			}
			return append(
				t`${msg}\nCause:`,
				t`\t${s(cause)}`,
			);
		},
	]
});

export const tlog = (...params: Parameters<typeof t>) => console.log(t(...params));
export const tlogRec = (values: Record<string, unknown>, breakEvery = 5) => {
	const labels = [...Object.keys(values).map((k, i) =>
		(i ? i % breakEvery === 0 ? `, \n` : `, ` : ``) + `${k}=`
	), ""];
	const vals = Object.values(values);
	return console.log(t(
		labels,
		...vals
	));
};