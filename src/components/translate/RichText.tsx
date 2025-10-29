import { FC } from "react";
import { isReadonlyArray, RichText } from "./richtext.ts";
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
	switch (text.type) {
		case "markup": {
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
		case "list": {
			switch (text.listType ?? "bullet") {
				case "numbered": {
					return (
						<ol className={css["list-numbered"]}>
							{text.entries.map(t => (
								<li><RichTextComponent text={t} /></li>
							))}
						</ol>
					);
				}
				case "bullet": {
					return (
						<ul className={css["list-bullet"]}>
							{text.entries.map((t, i) => (
								<li key={i}><RichTextComponent text={t} /></li>
							))}
						</ul>
					);
				}
			}
		}
		case "link": {
			const { url, target } = text;
			return (
				<a href={url} target={target ?? "_blank"}>
					<RichTextComponent text={text.text} />
				</a>
			);
		}
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to component", {
		cause: text,
	});
}