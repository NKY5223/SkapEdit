import { createMapContext } from "@hooks/createMapContext.tsx";
import { FC, PropsWithChildren, ReactNode } from "react";
import { toMap } from "../../common/toMap.tsx";

// #region Types
declare global {
	namespace Registry {
		export interface Translation {

		}
	}
}
/**
 * Add icon names with
 * ```ts
 * declare global {
 * 	namespace Registry {
 * 		export interface Icon {
 * 			// "key": {};
 * 		}
 * 	}
 * }
 * ```
 */
export type TKey = keyof Registry.Translation & string;
export type TVal<K extends TKey> = Registry.Translation[K];
export type TFunc<K extends string = string, V extends Record<string, unknown> = never> = (
	| string
	| TFunc<K, V>[]
	| ((values: V) => ReactNode)
);
// #endregion

export const [useTranslations, useTranslation, BaseTranslationProvider] = createMapContext<TFunc<TKey, TVal<TKey>>, string>("Translation");

type TranslateProps<K extends TKey> = {
	k: TKey;
} & Registry.Translation[K];
export const Translate: <K extends TKey>(props: TranslateProps<K>) => ReactNode = ({
	k: key,
	...values
}) => {
	const translation = useTranslation(key);

	if (!translation) {
		return (<TranslateFallback>{key}</TranslateFallback>);
	}

	return (<TranslateTranslation translation={translation} values={values} />);
}

type TranslationFallbackProps = {
	children: string;
};
export const TranslateFallback: FC<TranslationFallbackProps> = ({
	children: key
}) => {
	return (
		<em style={{
			fontFamily: "monospace",
			color: "var(--theme-error-fg)",
		}}>
			{key}
		</em>
	);
}

type TranslateTranslationProps<K extends TKey> = {
	translation: TFunc<K, TVal<K>>;
	values: TVal<K>;
};
export const TranslateTranslation: <K extends TKey>(props: TranslateTranslationProps<K>) => ReactNode = ({
	translation,
	values,
}) => {
	if (typeof translation === "string") {
		return translation;
	}
	if (Array.isArray(translation)) {
		return translation.map((t, i) => (
			<TranslateTranslation key={i} values={values} translation={t} />
		));
	}
	if (typeof translation === "function") {
		return translation(values);
	}
}

export const TranslationProvider: FC<PropsWithChildren<{ value: Record<string, TFunc> }>> = ({
	value,
	children
}) => {
	// Typecast because maps destroy information so :/
	return (
		<BaseTranslationProvider value={toMap<never>(value as {})}>
			{children}
		</BaseTranslationProvider>
	);
}