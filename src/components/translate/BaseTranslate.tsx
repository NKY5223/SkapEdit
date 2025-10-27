import { FC, ReactNode } from "react";
import { useBaseTranslator } from "./translate.ts";
import { RichTextComponent } from "./RichText.tsx";

export const BaseTranslate = <R extends Record<string, {}>, K extends keyof R>(args: { k: K; } & R[K]): ReactNode => {
	const { k: key } = args;
	const translator = useBaseTranslator<R>();
	const text = translator(key, args);
	return <RichTextComponent text={text} />;
}
BaseTranslate<{ 
	"test": { value: number } 
}, "test"> satisfies FC<{ k: "test", value: number }>;