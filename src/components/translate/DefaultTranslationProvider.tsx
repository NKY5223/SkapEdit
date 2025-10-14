import { FC, PropsWithChildren } from "react";
import { TranslationProvider } from "./Translate.tsx";
import { translations } from "./translations.tsx";


export const DefaultTranslationProvider: FC<PropsWithChildren> = ({ children }) => (
	<TranslationProvider value={translations}>
		{children}
	</TranslationProvider>
);
