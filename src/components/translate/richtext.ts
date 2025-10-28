export type RichText = (
	| string
	| number
	| readonly RichText[]
	| {
		italic?: boolean;
		code?: boolean;
		text: RichText;
	}
	| {
		list: readonly RichText[];
		type?: "numbered" | "bullet";
	});
export const isReadonlyArray: (value: unknown) => value is readonly unknown[] = Array.isArray;
// #region constructors

export const makeItalic = (text: RichText): RichText => ({ italic: true, text });
export const makeNumberedList = (...list: RichText[]): RichText => ({ list, type: "numbered" });
// #endregion
export const richTextToString = (text: RichText): string => {
	if (typeof text === "string" || typeof text === "number") {
		return String(text);
	}
	if (isReadonlyArray(text)) {
		return text.map(richTextToString).join("");
	}
	if ("text" in text) {
		return richTextToString(text.text);
	}
	if ("list" in text) {
		switch (text.type ?? "bullet") {
			case "numbered": {
				const lines = text.list.map((t, i) => [`${i}.`, t] as const);
				const max = Math.max(...lines.map(([i]) => i.length));
				return lines.map(([i, t]) => `${i.padEnd(max, " ")} ${t}`).join("\n");
			}
			case "bullet": {
				return text.list.map((t) => `• ${t}`).join("\n");
			}
		}
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to string", {
		cause: text,
	});
};
