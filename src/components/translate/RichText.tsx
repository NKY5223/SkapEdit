import { FC } from "react";
import { isReadonlyArray, RichText } from "./translate.ts";

export const RichTextComponent: FC<{ text: RichText }> = ({
	text
}) => {
	if (typeof text === "string") {
		return text;
	}
	if (isReadonlyArray(text)) {
		return text.map((t, i) => (
			<RichTextComponent key={i} text={t} />
		));
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to component", {
		cause: text,
	});
}