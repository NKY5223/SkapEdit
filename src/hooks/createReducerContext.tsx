import { maybeConst, MaybeConst } from "@common/maybeConst.ts";
import { createContext, Dispatch, FC, ReactNode, Reducer, useContext, useReducer } from "react";

export function createReducerContext<T, A>(name: string, reducer: Reducer<T, A>, defaultValue?: T): [
	useValue: () => T,
	useDispatch: () => Dispatch<A>,
	Provider: FC<{
		initialValue: T;
		children: MaybeConst<[T, Dispatch<A>], ReactNode>
	}>,
	useValueDispatch: () => [T, Dispatch<A>],
	context: React.Context<[T, Dispatch<A>] | null>
] {
	const context = createContext<[T, Dispatch<A>] | null>(null);
	const useValue = (): T => {
		const s = useContext(context);
		if (s === null) {
			if (defaultValue === undefined) {
				throw new Error("Cannot use context value without provider/default value");
			}
			return defaultValue;
		}
		return s[0];
	}
	const useDispatch = (): Dispatch<A> => {
		return useContext(context)?.[1] ??
			(action => console.warn(`Could not find reducer context dispatch function for`, action));
	}

	const Provider: FC<{ initialValue: T; children: MaybeConst<[T, Dispatch<A>], ReactNode>; }> = ({
		initialValue, children
	}) => {
		const [state, dispatch] = useReducer(reducer, initialValue);
		return (
			<context.Provider value={[state, dispatch]}>
				{maybeConst(children, [state, dispatch])}
			</context.Provider>
		);
	}
	Provider.displayName = `${name}Provider`;

	const useValueDispatch = () => {
		const s = useContext(context);
		if (!s) throw new Error("Cannot use context value & dispatch without provider");
		return s;
	}

	return [useValue, useDispatch, Provider, useValueDispatch, context];
}