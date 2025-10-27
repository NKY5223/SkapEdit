import { createContext, useContext } from "react";

export type RichText = (
	| string
	| readonly RichText[]
);

export const isReadonlyArray: (value: unknown) => value is readonly unknown[] = Array.isArray;

export const richTextToString = (text: RichText): string => {
	if (typeof text === "string") {
		return text;
	}
	if (isReadonlyArray(text)) {
		return text.map(richTextToString).join("");
	}
	text satisfies never;
	throw new TypeError("Could not convert rich text to string", {
		cause: text,
	});
}

/** `Translator<R>` is *contravariant* in `R`. */
export type Translator<in R extends Record<string, {}>> =
	<K extends keyof R>(key: K, args: R[K]) => RichText;

export type Translation<T extends {}, R extends Record<string, {}>> = (
	args: T,
	/** A translation can recursively call translate. */
	translate: Translator<R>,
) => RichText;

export const makeTranslator = <const R extends Record<string, {}>>(
	translations: {
		[K in keyof R]:
		| Translation<R[K], R>
		| ([R[K]] extends [{}]
			? RichText
			: never)
	}
): Translator<R> => {
	const translator: Translator<R> = (key, args) => {
		const translation = translations[key];
		if (typeof translation === "function") {
			return translation(args, translator);
		}
		return translation;
	};
	return translator;
}

// type hell
/**
 * @example
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
	<R extends Record<string, {}>>() => <
	K extends string, 
	N extends string,
>(
	key: K, name: N,
): Translation<
	{ [_ in N]: string; }, 
	Omit<R, keyof R & `${K}.${string}`> & {
		[_ in K]: {
			[_ in N]: string;
		}
	} & Record<keyof R & `${K}.${string}`, {}>
	// Argument of type '{}' is not assignable to parameter of type 
	// '(Omit<R, keyof R & `${K}.${string}`> & { [_ in K]: { [_ in N]: string; }; } & Record<keyof R & `${K}.${string}`, {}>)
	// [`${K}.${{ [_ in N]: string; }[N]}`]'.
	// what are you talking about
	// ok so
	// = (Omit<R, keyof R & `${K}.${string}`> & { [_ in K]: { [_ in N]: string; }; } & Record<keyof R & `${K}.${string}`, {}>)
	// [`${K}.${string}`]
	// = Omit<R, keyof R & `${K}.${string}`>[`${K}.${string}`]
	// & { [_ in K]: { [_ in N]: string; }; }[`${K}.${string}`]
	// & Record<keyof R & `${K}.${string}`, {}>[`${K}.${string}`]
	// = unknown
	// & unknown
	// & {}
	// = {}
	// ???
> => (args, translate) => translate(`${key}.${args[name]}`, {} as never);

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