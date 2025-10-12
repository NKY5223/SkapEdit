import { Dispatch, FC, ReactNode, Reducer, useReducer } from "react";
import { createMapContext } from "../../hooks/createMapContext.tsx";
import css from "./Layout.module.css";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutViewMemo } from "./LayoutView.tsx";
import { ViewToolbar } from "./LayoutViewToolbar.tsx";
import { Translate } from "@components/translate/Translate.tsx";

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
export type ID = string;
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
		type: "update_state"; 
		/** Target view node uuid */
		targetNode: ID;
		state: unknown;
	}
	| {
		type: "dispatch_to";
		targetNode: ID;
		action: unknown;
	}
);
export type LayoutFC<T extends Layout.Node, Props> = FC<{
	dispatchLayout: Dispatch<LayoutAction>;
	node: T;
} & Props>;


export namespace Layout {

	export type ViewProvider<State = unknown, Action = never> = {
		/** Name for this View (e.g. `"viewport"`) */
		name: string;
		/** Create a new view state */
		new: (id: string) => State;

		/**
		 * Additional validation for `ViewInfo`.
		 * `info.type` is checked against `this.name` before this.
		 */
		valid?: (info: unknown) => info is State;
		/**
		 * Check if an action is valid.
		 * @default () => true
		 */
		validAction?: (action: unknown) => action is Action;
		reducer: Reducer<State, Action>;

		Component: FC<{
			state: State;
			/**
			 * Dispatch a state update to the layout
			 */
			dispatchLayout: Dispatch<LayoutAction>;
			/**
			 * Dispatch a state update to this view
			 */
			dispatchThis: Dispatch<Action>;
			/**
			 * Dispatch a state update to some other view
			 * (may or may not crash idk)
			 * @returns `true` if the view accepted this update, `false` otherwise
			 */
			dispatchTo: <A>(id: string, action: A) => boolean;

			/** View Switcher component. Should be included in the view. */
			viewSwitch: ReactNode;
		}>;
	};

	export type Root = {
		tree: Tree;
	};

	export type Tree = {
		node: Node;
	};

	type BaseNode<T extends string> = {
		type: T;
		id: string;
	};
	export type NodeView = BaseNode<"view"> & {
		providerName: string;
		state: unknown;
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

export const emptyViewProvider: Layout.ViewProvider<{}> = {
	name: "empty",
	new: () => ({}),
	reducer: () => ({}),
	Component: ({
		viewSwitch
	}) => (
		<div>
			<ViewToolbar>{viewSwitch}</ViewToolbar>
			<Translate k="layout.view.empty" />
		</div>
	)
}

// #endregion

const setInLayout = (
	root: Layout.Node,
	id: string,
	f: (node: Layout.Node) => Layout.Node,
): [success: boolean, newNode: Layout.Node] => {
	if (root.id === id) {
		return [true, f(root)];
	}
	switch (root.type) {
		case "view": {
			return [false, root];
		}
		case "split": {
			const [foundFirst, first] = setInLayout(root.first, id, f);
			if (foundFirst) {
				return [true, {
					...root,
					first,
				}];
			}
			const [foundSecond, second] = setInLayout(root.second, id, f);
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
	switch (action.type) {
	}
	return layout;
}

export const [useViewProviders, useViewProvider, ViewsProviderProvider, ] = createMapContext<Layout.ViewProvider>();
export const [useViewStates, useViewState, ViewInfoStatesProvider, ] = createMapContext<unknown>();

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
