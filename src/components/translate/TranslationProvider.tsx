import { useSetting } from "@components/settings/settings.ts";
import { FC, PropsWithChildren, useEffect } from "react";
import { languages } from "./languages.ts";
import { translatorContext } from "./translate.ts";

export const TranslationProvider: FC<PropsWithChildren> = ({
	children
}) => {
	const langCode = useSetting("language");
	const language = languages.find(l => l.code === langCode) ?? languages[0];

	useEffect(() => {
		document.documentElement.lang = langCode;
	}, [langCode])

	// @ts-expect-error trust me bro
	return <translatorContext.Provider value={() => language.translator}>
		{children}
	</translatorContext.Provider>
}