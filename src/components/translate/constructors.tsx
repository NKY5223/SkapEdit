import { ReactNode } from "react";
import { TranslateFallback, TFunc, useTranslation, TranslateTranslation, TKey } from "./Translate.tsx";

type MergeNever<A, B> = [A] extends [never] ? B : A & B;
/**
 * @example
 * ...
 * "example.key": delegate("example.key", "value"),
 * ...
 *
 * <Translate k="example.key" value="value" />
 *     ↓    ↓    ↓
 * <Translate k="example.key.value" value="value" />
 */
export function delegate<K extends string, N extends string, V extends Record<string, unknown>>(
	key: K, valueName: N,
	seperator: string = ".",
	fallback?: ReactNode 
): TFunc<K, MergeNever<V, Record<N, string>>> {
	return (values) => {
		const value = values[valueName];
		if (!value) return fallback ?? (
			<TranslateFallback>{`${key}(delegate)`}</TranslateFallback>
		);
		if (typeof value === "string") {
			const newKey = `${key}${seperator}${value}`;
			const t = useTranslation(newKey);
			if (!t) {
				return (<TranslateFallback>{newKey}</TranslateFallback>);
			}
			return (<TranslateTranslation values={values} translation={t} />);
		}
		return fallback;
	};
}
export function createTranslations<T extends Record<string, TFunc>>(translations: T): T {
	return translations;
}
export type Infer<T extends Record<string, TFunc>> = {
	[k in keyof T]:
	T[k] extends TFunc<string, {}>
	? {}
	: T[k] extends TFunc<string, infer V>
	? V
	: {};
}