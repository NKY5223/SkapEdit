import { FC } from "react";
import { isReadonlyArray, RichText } from "./translate.ts";
import { toClassName } from "@components/utils.tsx";
import css from "./RichText.module.css";

export const RichTextComponent: FC<{ text: RichText }> = ({
	text
}) => {
	if (typeof text === "string" || typeof text === "number") {
		return String(text);
	}
	if (isReadonlyArray(text)) {
		return text.map((t, i) => (
			<RichTextComponent key={i} text={t} />
		));
	}
	if ("text" in text) {
		const { italic, code } = text;
		const className = toClassName(
			italic === true && css["italic-true"],
			italic === false && css["italic-false"],
			code === true && css["code-true"],
			code === false && css["code-false"],
		);
		return (
			<span className={className}>
				<RichTextComponent text={text.text} />
			</span>
		);
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to component", {
		cause: text,
	});
}