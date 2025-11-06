import { maybeConst } from "@common/maybeConst.ts";
import { mapWith } from "@components/utils.tsx";
import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useContext, useState } from "react";

export function createMapStateContext<T, K = string>(
	name: string,
) {
	const context = createContext<[ReadonlyMap<K, T>, Dispatch<SetStateAction<ReadonlyMap<K, T>>>] | null>(null);
	const use = () => {
		const c = useContext(context);
		if (!c) throw new Error("Cannot use context without provider");
		return c;
	}
	const useMapContext = () => use()[0];
	const useMapContextEntry = (key: K) => useMapContext().get(key);
	const useSetMap = () => use()[1];
	const useSetEntry = () => {
		const set = useSetMap();
		return (key: K, action: SetStateAction<T | undefined>) =>
			set(map => {
				// @ts-expect-error uhhh weird type error
				const newValue = maybeConst(action, map.get(key));
				if (newValue === undefined) return map;
				return mapWith(map, key, newValue);
			});
	}

	const Provider: FC<PropsWithChildren<{ initialValue?: ReadonlyMap<K, T> }>> = ({
		initialValue = new Map(),
		children
	}) => {
		const stuff = useState(initialValue);
		return (
			<context.Provider value={stuff}>
				{children}
			</context.Provider>
		);
	};
	Provider.displayName = `${name}Provider`;
	// context.Provider does not have a displayName field (why?)
	// But setting displayName does change its displayName (???)
	Object.assign(context.Provider, { displayName: `${name}Context` });


	return [useMapContext, useMapContextEntry, useSetMap, useSetEntry, Provider, context] as const;
}