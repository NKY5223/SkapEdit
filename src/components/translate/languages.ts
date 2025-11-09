import { Translator } from "./translate.ts"
import { translator_en_US } from "./translation/en_US.ts";
import { translator_zh_Hans } from "./translation/zh_Hans.ts";
import { TranslationArgs } from "./translationArgs.ts"

export type Language = {
	code: string;
	name: string;
	translator: Translator<TranslationArgs>;
}

export const languages: Language[] = [
	{
		code: "en-US",
		name: "English (US)",
		translator: translator_en_US,
	},
	{
		code: "zh-Hans",
		name: "简体中文",
		translator: translator_zh_Hans,
	},
]