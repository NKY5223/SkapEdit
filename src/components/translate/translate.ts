import { createContext, useContext } from "react";
import { RichText, richTextToString } from "./richtext.ts";

type TranslatorFunc<R extends Record<string, {}>> = 
	<K extends keyof R>(key: K, args: R[K]) => RichText;
type TranslatorAttrs = {
	readonly warnings: Set<string>;
};

/** `Translator<R>` is *contravariant* in `R`. */
export type Translator<R extends Record<string, {}>> = TranslatorFunc<R> & TranslatorAttrs;

export type Translation<T extends {}, R extends Record<string, {}>> = (
	args: T,
	/** A translation can recursively call translate. */
	translate: Translator<R>,
) => RichText;

const exportWarnedTranslations = (warnings: Set<string>) => ({
	"export": "",
	get CLICK_TO_EXPORT() {
		console.log(warnings.values()
			.toArray()
			.sort()
			.map(s => `${JSON.stringify(s)}: {};`)
			.join("\n")
		);
		console.log(warnings.values()
			.toArray()
			.sort()
			.map(s => `${JSON.stringify(s)}: "",`)
			.join("\n")
		);
		return `Copy console log`;
	},
});

export const makeTranslator = <const R extends Record<string, {}>>(
	translations: {
		[K in keyof R]:
		| Translation<R[K], R>
		| ([R[K]] extends [{}]
			? RichText
			: never)
	}
): Translator<R> => {
	const translator: Translator<R> = Object.assign<TranslatorFunc<R>, TranslatorAttrs>((key, args) => {
		const translation = translations[key];
		if (translation === undefined) {
			const warnings = translator.warnings;
			if (!warnings.has(String(key))) {
				warnings.add(String(key));
				console.warn("Missing translation:", key, args, "\n", 
					exportWarnedTranslations(warnings));
			}
			return {
				italic: true,
				code: true,
				text: String(key),
			};
		}
		if (typeof translation === "function") {
			return translation(args, translator);
		}
		return translation;
	}, {
		warnings: new Set<string>(),
	});
	return translator;
}

// type hell
/**
 * @example
 * const delegate = delegateOn<{ 
 * 	"example.key": { value: string };
 * 	"example.key.value"
 * }>
 * ...
 * "example.key": delegate("example.key", "value"),
 * ...
 *
 * <Translate k="example.key" value="value" />
 *     ↓    ↓    ↓
 * <Translate k="example.key.value" />
 */
export const delegateOn = 
	// Funny trick to 'curry' a type parameter
<
	R extends Record<string, {}>,
	S extends string = ".",
>(
	seperator: S,
) => <
	K extends string, 
	N extends string,
>(
	key: K, 
	name: N, 
): Translation<
	{ [_ in N]: string; }, 
	Omit<R, keyof R & `${K}${S}${string}`> & {
		[_ in K]: {
			[_ in N]: string;
		}
	} & Record<keyof R & `${K}${S}${string}`, {}>
	// Argument of type '{}' is not assignable to parameter of type 
	// '(Omit<R, keyof R & `${K}.${string}`> & { [_ in K]: { [_ in N]: string; }; } & Record<keyof R & `${K}.${string}`, {}>)
	// [`${K}.${{ [_ in N]: string; }[N]}`]'.
	// what are you talking about
	// ok so
	// = (Omit<R, keyof R & `${K}.${string}`> & { [_ in K]: { [_ in N]: string; }; } & Record<keyof R & `${K}.${string}`, {}>)
	//     [`${K}.${string}`]
	// = Omit<R, keyof R & `${K}.${string}`>[`${K}.${string}`]
	//     & { [_ in K]: { [_ in N]: string; }; }[`${K}.${string}`]
	//     & Record<keyof R & `${K}.${string}`, {}>[`${K}.${string}`]
	// = unknown
	//     & unknown
	//     & {}
	// = {}
	// ???
> => (args, translate) => translate(`${key}${seperator}${args[name]}`, {} as never);

// type Equal<A, B> = 
// 	[(a: A) => A] extends [(b: B) => B] 
// 	? true : false;
// type Expect<T extends true> = T;

// type test = [
// 	Expect<Equal<{[_ in "test" | "uwu"]: string}["test" | "uwu"], string>>,
// ];

export const translatorContext = createContext<<R extends Record<string, {}>>() => Translator<R>>(() => {
	throw new Error("Missing translation provider");
});
export const useBaseTranslator = <R extends Record<string, {}>>() => {
	return useContext(translatorContext)<R>();
}
export const useBaseTranslationString = <R extends Record<string, {}>>() => {
	const translator = useContext(translatorContext)<R>();
	return <K extends keyof R>(key: K, args: R[K]) => richTextToString(translator(key, args));
}