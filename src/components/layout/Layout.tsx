import { Dispatch, FC, ReactNode, Reducer, useReducer } from "react";
import { createMapContext } from "../../hooks/createMapContext.tsx";
import css from "./Layout.module.css";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutViewMemo, makeView } from "./LayoutView.tsx";
import { ID } from "@common/uuid.ts";
import { IconName } from "@components/icon/IconName.ts";

/*
2025-02-xx
Goal:
Be able to edit some arbitrary data with multiple views
tagged data?

2025-03-24
what the fuck does "tagged data" mean wtf nky
i don't know if we need floating views

2025-04-03
floating views would be nice :3
spiky `:3` :(

data
| Layout
|	> split
|		> view
|-----------> viewport (map)
|		> view
|-----------> inspector (map)
|	> floating
|		> view
|-----------> stats (all)
|	> floating
|	 	> view
|-----------> ??? (some other field in data)
*/
// #region Types
export type LayoutAction = (
	| {
		type: "replace";
		/** Target node uuid */
		targetNode: ID;
		replacement: Layout.Node;
	}
	| {
		type: "set_ratio";
		/** Target split node uuid */
		targetNode: ID;
		ratio: number;
	}
	| {
		type: "set_view";
		/** Target view node uuid */
		targetNode: ID;
		providerName: string;
	}
);
export type LayoutFC<T extends Layout.Node, Props> = FC<{
	dispatchLayout: Dispatch<LayoutAction>;
	node: T;
} & Props>;


export namespace Layout {

	export type ViewComponent = FC<{
		/**
		 * Dispatch an update to the layout
		 */
		dispatchLayout: Dispatch<LayoutAction>;
		/** View Switcher component. Should be included in the view. */
		viewSwitch: ReactNode;
	}>;

	export type ViewProvider = {
		/** Name for this View (e.g. `"viewport"`) */
		name: string;
		Component: ViewComponent;
		icon?: IconName;
	};

	export type Root = {
		tree: Tree;
	};

	export type Tree = {
		node: Node;
	};

	type BaseNode<T extends string> = {
		type: T;
		id: ID;
	};
	export type NodeView = BaseNode<"view"> & {
		providerName: string;
	};
	export type NodeSplit = BaseNode<"split"> & {
		axis: "x" | "y";
		ratio: number;
		first: Node;
		second: Node;
	};

	export type Node = (
		| NodeSplit 
		| NodeView
	);
}

// #endregion

/**
 * @returns If node was successfully replaced, returns `[true, newNode]`. Else, `[false, oldNode]`.
 */
const setInLayout = (
	root: Layout.Node,
	target: string,
	/** function that transforms old node into new node */
	f: (node: Layout.Node) => Layout.Node,
): [success: boolean, newNode: Layout.Node] => {
	if (root.id === target) {
		return [true, f(root)];
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
}

const layoutReducer: Reducer<Layout.Root, LayoutAction> = (layout, action) => {
	const rootNode = layout.tree.node;
	switch (action.type) {
		case "replace": {
			const { targetNode, replacement } = action;
			const [success, newNode] = setInLayout(rootNode, targetNode, () => replacement);
			if (!success) console.warn("Could not find target node", targetNode, ".");
			return {
				tree: {
					node: newNode,
				}
			};
		}
		case "set_ratio": {
			const { targetNode, ratio } = action;
			const [success, newNode] = setInLayout(rootNode, targetNode, node => ({ ...node, ratio }));
			if (!success) console.warn("Could not find target node", targetNode, ".");
			return {
				tree: {
					node: newNode,
				}
			};
		}
		case "set_view": {
			const { targetNode, providerName } = action;
			const [success, newNode] = setInLayout(rootNode, targetNode, () => makeView(providerName));
			if (!success) console.warn("Could not find target node", targetNode, ".");
			return {
				tree: {
					node: newNode,
				}
			};
		}
	}
	console.warn("YOU DIDN'T IMPLEMENT LAYOUT REDUCER FOR", action);
	return layout;
}

export const [useViewProviders, useViewProvider, ViewsProviderProvider, ] = createMapContext<Layout.ViewProvider>("ViewProvider");
export const [useViewStates, useViewState, ViewInfoStatesProvider, ] = createMapContext<unknown>("??");

type LayoutProps = {
	layout: Layout.Root;
	viewProviders: ReadonlyMap<string, Layout.ViewProvider>;
};
export const Layout: FC<LayoutProps> = ({
	layout: initialLayout,
	viewProviders,
}) => {
	const [layout, dispatchLayout] = useReducer(layoutReducer, initialLayout);
	const node = layout.tree.node;
	return (
		<ViewInfoStatesProvider value={new Map()}>
			<ViewsProviderProvider value={viewProviders}>
				<div className={css["layout"]}>
					<LayoutNode node={node} dispatchLayout={dispatchLayout} />
				</div>
			</ViewsProviderProvider>
		</ViewInfoStatesProvider>
	);
}

type LayoutNodeProps = {
	node: Layout.Node;
	dispatchLayout: Dispatch<LayoutAction>;
};
const LayoutNode: FC<LayoutNodeProps> = ({
	node,
	dispatchLayout,
}) => {
	switch (node.type) {
		case "split": {
			const { first, second } = node;
			return (
				<LayoutSplit node={node} dispatchLayout={dispatchLayout}>
					<LayoutNode node={first} dispatchLayout={dispatchLayout} />
					<LayoutNode node={second} dispatchLayout={dispatchLayout} />
				</LayoutSplit>
			);
		}
		case "view": {
			const { } = node;
			return (
				<LayoutViewMemo node={node} dispatchLayout={dispatchLayout} />
			);
		}
	}
	const errorMessage = `Layout error: could not make \n${JSON.stringify(node, null, "\t")}`;
	throw new Error(errorMessage, { cause: node });
}
