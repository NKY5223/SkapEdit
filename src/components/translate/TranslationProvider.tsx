import { FC, PropsWithChildren } from "react"
import { translatorContext, Translator } from "./translate.ts"

export const TranslationProvider: FC<PropsWithChildren<{
	value: Translator<never>
}>> = ({
	value, children
}) => {
	/** OOOO SCARY TYPECAST */
	return <translatorContext.Provider value={() => value as never}>
		{children}
	</translatorContext.Provider>
}