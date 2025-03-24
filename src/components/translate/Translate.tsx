import { createContext, FC, PropsWithChildren, ReactNode, useContext } from "react";

// #region Types
export type Value = (
	| {
		type: "number";
		value: number;
	}
	| {
		type: "string";
		value: string;
	}
);
export type Translation = (
	| string
	| Translation[]
	| {
		translation: string;
	}
	| {
		value: string;
		fallback?: ReactNode;
	}
);
// #endregion

const translationsContext = createContext<ReadonlyMap<string, Translation>>(new Map());
export const useTranslations = () => useContext(translationsContext);
function useTranslation(key: string) {
	const translations = useTranslations();
	const translation = typeof key === "string" ? translations.get(key) : key;
	return translation;
}

type TranslationKey = "test" | string & {};
type TranslateProps = {
	children: TranslationKey;
	values?: Record<string, unknown>;
};
export const Translate: FC<TranslateProps> = ({
	children: key,
	values
}) => {
	const translation = useTranslation(key);

	if (!translation) {
		return (<TranslateFallback>{key}</TranslateFallback>);
	}
	const convertedValues: ReadonlyMap<string, Value> =
		new Map(Object.entries(values ?? {}).map<[string, Value]>(([key, value]) => {
			switch (typeof value) {
				case "string":
					return [key, {
						type: "string",
						value,
					}];
				case "number":
					return [key, {
						type: "number",
						value,
					}];
			}
			throw new TypeError(`Cannot convert ${value} to Value.`)
		}));

	return (<TranslateTranslation translation={translation} values={convertedValues} />);
}

type TranslationFallbackProps = {
	children: string;
};
const TranslateFallback: FC<TranslationFallbackProps> = ({
	children: key
}) => {
	return (
		<pre>Translate{"{"} {key} {"}"}</pre>
	);
}

type TranslateTranslationProps = {
	translation: Translation;
	values: ReadonlyMap<string, Value>;
};
const TranslateTranslation: FC<TranslateTranslationProps> = ({
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
	if ("translation" in translation) {
		const t = useTranslation(translation.translation);
		if (t) {
			return (
				<TranslateTranslation values={values} translation={t} />
			);
		}
		return (
			<TranslateFallback>{translation.translation}</TranslateFallback>
		);
	}
	if ("value" in translation) {
		const value = values.get(translation.value);
		if (!value) {
			if (translation.fallback) {
				return translation.fallback;
			}
			return (
				<pre>Value{"{"} {translation.value} {"}"}</pre>
			);
		}
		return stringifyValue(value);
	}
}

type TranslationProviderProps = PropsWithChildren<{
	translations: ReadonlyMap<string, Translation>;
	extend?: boolean;
}>;
export const TranslationProvider: FC<TranslationProviderProps> = ({
	translations,
	extend = true,
	children,
}) => {
	const existing = useTranslations();
	const newTranslations = (extend
		? new Map([
			...existing,
			...translations
		])
		: translations
	);

	return (
		<translationsContext.Provider value={newTranslations}>
			{children}
		</translationsContext.Provider>
	);
}


function stringifyValue(value: Value): ReactNode {
	switch (value.type) {
		case "string": {
			return value.value;
		}
		case "number": {
			return value.value, toString();
		}
	}
}

export function toMap<T>(obj: Record<string, T>): ReadonlyMap<string, T> {
	return new Map(Object.entries(obj));
}