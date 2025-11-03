import { FC, PropsWithChildren } from "react"
import { translatorContext, Translator } from "./translate.ts"

export const TranslationProvider: FC<PropsWithChildren<{
	/** `<never>` means it is as wide as possible since `Translator` is contravariant */
	value: Translator<never>
}>> = ({
	value, children
}) => {
	// @ts-expect-error trust me bro
	return <translatorContext.Provider value={() => value}>
		{children}
	</translatorContext.Provider>
}