import { createContext, FC, PropsWithChildren, useContext } from "react";

export function createMapContext<T, K = string>(name: string, defaultValue: ReadonlyMap<K, T> = new Map()) {
	const context = createContext<ReadonlyMap<K, T>>(defaultValue);
	const useMapContext = () => useContext(context);
	const useMapContextEntry = (key: K) => useContext(context).get(key);

	const Provider: FC<PropsWithChildren<{ value: ReadonlyMap<K, T>, extend?: boolean }>> = ({
		value, extend = true,
		children
	}) => {
		const ctx = useMapContext();
		return (
			<context.Provider value={extend
				? new Map([
					...ctx,
					...value.entries(),
				])
				: value
			}>
				{children}
			</context.Provider>
		);
	};
	Provider.displayName = `${name}Provider`;
	// context.Provider does not have a displayName field (why?)
	// But setting displayName does change its displayName (???)
	Object.assign(context.Provider, { displayName: `${name}Context` });

	const result: [
		useMapContext: () => ReadonlyMap<K, T>,
		useMapContextEntry: (key: K) => T | undefined,
		Provider: FC<PropsWithChildren<{
			value: ReadonlyMap<K, T>;
			extend?: boolean;
		}>>,
		context: React.Context<ReadonlyMap<K, T>>
	] = [useMapContext, useMapContextEntry, Provider, context];

	return result;
}