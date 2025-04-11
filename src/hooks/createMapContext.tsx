import { createContext, FC, PropsWithChildren, useContext } from "react";

export function createMapContext<T, K = string>(defaultValue: ReadonlyMap<K, T> = new Map()) {
	type M = ReadonlyMap<K, T>;

	const context = createContext<M>(defaultValue);
	const useMapContext = () => useContext(context);
	const useMapContextEntry = (key: K) => useContext(context).get(key);

	const Provider: FC<PropsWithChildren<{ value: M, extend?: boolean }>> = ({
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

	const result: [
		useMapContext: () => M,
		useMapContextEntry: (key: K) => T | undefined,
		Provider: FC<PropsWithChildren<{
			value: M;
			extend?: boolean;
		}>>,
		context: React.Context<M>
	] = [useMapContext, useMapContextEntry, Provider, context];

	return result;
}