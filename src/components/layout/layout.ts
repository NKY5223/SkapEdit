import { maybeConst, MaybeConst } from "@common/maybeConst.ts";
import { createId, ID } from "@common/uuid.ts";
import { IconName } from "@components/icon/icons";
import { createMapContext } from "@hooks/createMapContext.tsx";
import { createMapStateContext } from "@hooks/createMapStateContext";
import { createReducerContext } from "@hooks/createReducerContext.tsx";
import { createContext, Dispatch, FC, ReactNode, Reducer, SetStateAction } from "react";


export namespace Layout {
	export type ViewComponent<S = null, A = never> = FC<{
		/** View Switcher component. Should be included in the view. */
		viewSwitcher: ReactNode;
		state: S;
		dispatchView: Dispatch<A>;
	}>;

	export type ViewProvider<S = null, A = never> = {
		/** Name for this View (e.g. `"viewport"`) */
		name: string;
		Component: ViewComponent<S, A>;
		icon?: IconName;
		reducer: Reducer<S, A>;
		newState: () => S;
	};

	export type Tree = {
		node: Node;
	};

	type BaseNode<T extends string> = {
		type: T;
		id: ID;
	};
	export type ViewNode<S = unknown, A = never> = BaseNode<"view"> & {
		providerName: string;
		state: S;
	};
	export type SplitNode = BaseNode<"split"> & {
		axis: "x" | "y";
		ratio: number;
		first: Node;
		second: Node;
	};

	export type Node = (
		| SplitNode
		| ViewNode
	);
}

/**
 * @returns If node was successfully replaced, returns `[true, newNode]`, else `[false, oldNode]`.
 */
const setInLayout = (
	root: Layout.Node,
	target: string,
	/** function that transforms old node into new node */
	f: SetStateAction<Layout.Node>,
): [success: boolean, newNode: Layout.Node] => {
	if (root.id === target) {
		return [true, maybeConst(f, root)];
	}
	switch (root.type) {
		case "view": {
			return [false, root];
		}
		case "split": {
			const [foundFirst, first] = setInLayout(root.first, target, f);
			if (foundFirst) {
				return [true, {
					...root,
					first,
				}];
			}
			const [foundSecond, second] = setInLayout(root.second, target, f);
			if (foundSecond) {
				return [true, {
					...root,
					second,
				}];
			}
			return [false, root];
		}
	}
};

export type LayoutAction = (
	| {
		type: "replace";
		/** Target node uuid */
		targetNode: ID;
		replacement: SetStateAction<Layout.Node>;
	}
	| {
		type: "set_ratio";
		/** Target split node uuid */
		targetNode: ID;
		ratio: number;
	}
);
const layoutReducer: Reducer<Layout.Tree, LayoutAction> = (layout, action) => {
	const rootNode = layout.node;
	switch (action.type) {
		case "replace": {
			const { targetNode, replacement } = action;
			const [success, newNode] = setInLayout(rootNode, targetNode, replacement);
			if (!success) console.warn("Could not find target node", targetNode, ".");
			return {
				node: newNode,
			};
		}
		case "set_ratio": {
			const { targetNode, ratio } = action;
			const [success, newNode] = setInLayout(rootNode, targetNode, node => ({ ...node, ratio }));
			if (!success) console.warn("Could not find target node", targetNode, ".");
			return {
				node: newNode,
			};
		}
	}
	throw new Error(`Layout action not implemented: ${action["type"]}`);
};

const [useViewProviders, useViewProviderInternal, ViewProvidersProviderInternal] =
	createMapContext<Layout.ViewProvider>("ViewProvider");
export { useViewProviders, ViewProvidersProviderInternal };
export const useViewProvider = <S, A>(name: string): Layout.ViewProvider<S, A> => {
	// @ts-expect-error whatever idc about typesafety
	return useViewProviderInternal(name);
}

export const [useLayoutTree, useDispatchLayout, LayoutProvider] =
	createReducerContext<Layout.Tree, LayoutAction>("Layout", layoutReducer);


// #region constructors
export const makeSplit = (axis: "x" | "y", ratio: number, first: Layout.Node, second: Layout.Node): Layout.SplitNode => ({
	type: "split",
	id: createId("layout.split"),
	axis,
	first,
	second,
	ratio,
});
export const makeSplitX = (ratio: number, left: Layout.Node, right: Layout.Node) => makeSplit("x", ratio, left, right);
export const makeSplitY = (ratio: number, top: Layout.Node, bottom: Layout.Node) => makeSplit("y", ratio, top, bottom);
export const makeView = <S, A>(provider: Layout.ViewProvider<S, A>, state?: S): Layout.ViewNode<S> => {
	return {
		type: "view",
		id: createId("layout.view"),
		providerName: provider.name,
		state: state ?? provider.newState(),
	};
};

export const makeStatelessViewProvider = (viewProvider: Pick<Layout.ViewProvider, "name" | "Component" | "icon">): Layout.ViewProvider => ({
	reducer: s => s,
	newState: () => null,
	...viewProvider,
})
export const makeViewProvider = <S, A>(viewProvider: Layout.ViewProvider<S, A>) => viewProvider;
// #endregion