export type RichText = (
	| string
	| number
	| readonly RichText[]
	| {
		type: "markup";
		bold?: boolean;
		italic?: boolean;
		code?: boolean;
		text: RichText;
	}
	| {
		type: "list";
		listType?: "numbered" | "bullet";
		entries: readonly RichText[];
	}
	| {
		type: "link";
		url: string;
		target?: React.HTMLAttributeAnchorTarget;
		text: RichText;
	}
);
export const isReadonlyArray: (value: unknown) => value is readonly unknown[] = Array.isArray;
// #region constructors

const isMarkup = (text: RichText) => typeof text === "object" && "type" in text && text.type === "markup";

export const makeBold = (text: RichText): RichText => (
	isMarkup(text)
		? { ...text, bold: true }
		: {
			type: "markup",
			bold: true,
			text,
		}
);
export const makeItalic = (text: RichText): RichText => (
	isMarkup(text)
		? { ...text, italic: true }
		: {
			type: "markup",
			italic: true,
			text,
		}
);
export const makeCode = (text: RichText): RichText => (
	isMarkup(text)
		? { ...text, code: true }
		: {
			type: "markup",
			code: true,
			text,
		}
);
export const makeLink = (url: string, text: RichText, target?: React.HTMLAttributeAnchorTarget): RichText => ({
	type: "link",
	url,
	text,
	target,
});
export const makeNumberedList = (...entries: RichText[]): RichText => ({
	type: "list",
	listType: "numbered",
	entries,
});
// #endregion
export const richTextToString = (text: RichText): string => {
	if (typeof text === "string" || typeof text === "number") {
		return String(text);
	}
	if (isReadonlyArray(text)) {
		return text.map(richTextToString).join("");
	}
	switch (text.type) {
		case "markup": {
			return richTextToString(text.text);
		}
		case "list": {
			switch (text.listType ?? "bullet") {
				case "numbered": {
					const lines = text.entries.map((t, i) => [`${i}.`, t] as const);
					const max = Math.max(...lines.map(([i]) => i.length));
					return lines.map(([i, t]) => `${i.padEnd(max, " ")} ${t}`).join("\n");
				}
				case "bullet": {
					return text.entries.map((t) => `• ${t}`).join("\n");
				}
			}
		}
		case "link": {
			return richTextToString(text.text);
		}
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to string", {
		cause: text,
	});
};
