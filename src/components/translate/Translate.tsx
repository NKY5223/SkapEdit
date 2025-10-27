import { ReactNode } from "react";
import { BaseTranslate } from "./BaseTranslate.tsx";
import { TranslationArgs } from "./translationArgs.ts";

export const Translate:
	<K extends keyof TranslationArgs>(args: { k: K } & TranslationArgs[K]) =>
		ReactNode = BaseTranslate;