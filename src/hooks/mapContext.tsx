import { createContext, FC, PropsWithChildren, useContext } from "react";

export function createMapContext<T>(defaultValue: ReadonlyMap<string, T> = new Map()) {
	type M = ReadonlyMap<string, T>;

	const context = createContext<M>(defaultValue);
	const useMapContext = () => useContext(context);
	const useMapContextEntry = (key: string) => useContext(context).get(key);

	const Provider: FC<PropsWithChildren<{ value: M, extend?: boolean }>> = ({
		value, extend = true,
		children
	}) => (
		<context.Provider value={
			extend
				? new Map([
					...useMapContext(),
					...value.entries(),
				])
				: useMapContext()
		}>
			{children}
		</context.Provider>
	);

	const result: [
		useMapContext: () => M, 
		useMapContextEntry: (key: string) => T | undefined, 
		Provider: FC<PropsWithChildren<{
			value: M;
			extend?: boolean;
		}>>, 
		context: React.Context<M>
	] = [useMapContext, useMapContextEntry, Provider, context];

	return result;
}