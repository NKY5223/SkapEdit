import { Dispatch, FC, ReactNode, Reducer, useReducer } from "react";
import { createMapContext } from "../../hooks/createMapContext.tsx";
import css from "./Layout.module.css";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutViewMemo, ViewFC } from "./LayoutView.tsx";

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
type BaseDesc<T extends string> = {
	type: T;
	id: string;
}
export type LayoutDescView = BaseDesc<"view"> & {
	/** id reference */
	viewId: string;
};
export type LayoutDescSplit = BaseDesc<"split"> & {
	axis: "x" | "y";
	ratio: number;
	first: LayoutDesc;
	second: LayoutDesc;
};

export type LayoutDesc = (
	| LayoutDescView
	| LayoutDescSplit
);

export type ViewInfo<T = unknown> = {
	id: string;
	type: string;
	state: T;
};
export type View<T = unknown, A = never> = {
	/** Name for this View (e.g. `"viewport"`) */
	name: string;
	/** Create a new view state */
	new: (id: string) => T;
	
	/**
	 * Additional validation for `ViewInfo`.  
	 * `info.type` is checked against `this.name` before this.
	 */
	valid?: (info: ViewInfo) => info is ViewInfo<T>;
	/** 
	 * Check if an action is valid. 
	 * @default () => true 
	 */
	validAction?: (action: unknown) => action is A;
	reducer: Reducer<T, A>;

	Component: FC<{
		state: T;
		dispatch: Dispatch<A>;
		/**
		 * Dispatch a state update to some other view
		 * (may or may not crash idk)
		 * @returns `true` if the view accepted this update, `false` otherwise
		 */
		dispatchTo: <T>(id: string, action: T) => boolean;
		
		/** View Switcher component. Should be included in the view. */
		viewSwitch: ReactNode;
	}>;
}

export type LayoutRoot = {
	views: ViewInfo[];
	tree: LayoutDesc;
}

type BaseAction<T extends string> = {
	type: T;
	target: LayoutDesc;
};
export type LayoutAction = (
	| BaseAction<"set_view"> & {
		view: string | null;
	}
	| BaseAction<"set_ratio"> & {
		ratio: number;
	}
	| BaseAction<"replace"> & {
		desc: LayoutDesc;
	}
);
export type LayoutFC<T extends LayoutDesc, Props> = FC<{
	dispatch: Dispatch<LayoutAction>;
	desc: T;
} & Props>;
// #endregion

const setInLayout = <T extends LayoutDesc>(
	layout: LayoutDesc,
	target: LayoutDesc,
	set: T,
): [boolean, LayoutDesc] => {
	if (target.id === layout.id) {
		return [true, set];
	}
	switch (layout.type) {
		case "view": {
			return [false, layout];
		}
		case "split": {
			const [foundFirst, first] = setInLayout(layout.first, target, set);
			const [foundSecond, second] = setInLayout(layout.second, target, set);
			if (!foundFirst && !foundSecond) return [false, layout];
			return [true, {
				...layout,
				first,
				second,
			}];
		}
	}
}

const layoutReducer: Reducer<LayoutDesc, LayoutAction> = (layout, action) => {
	switch (action.type) {
		case "replace": {
			const { target, desc } = action;
			const [found, newLayout] = setInLayout(layout, target, desc);

			if (!found) console.warn("Could not find", target, "in layout:", layout);
			return newLayout;
		}
		case "set_view": {
			const { target, view } = action;
			const [found, newLayout] = setInLayout(layout, target, {
				...target,
				view,
			});

			if (!found) console.warn("Could not find", target, "in layout:", layout);
			return newLayout;
		}
		case "set_ratio": {
			const { target, ratio } = action;
			const [found, newLayout] = setInLayout(layout, target, {
				...target,
				ratio,
			});

			if (!found) console.warn("Could not find", target, "in layout:", layout);
			return newLayout;
		}
	}
}

export const [useViews, useView, ViewsProvider, viewsContext] = createMapContext<ViewFC>();

type LayoutProps = {
	layout: LayoutDesc;
	views: ReadonlyMap<string, ViewFC>;
};
export const Layout: FC<LayoutProps> = ({
	layout: initialLayout,
	views,
}) => {
	const [layout, dispatchLayout] = useReducer(layoutReducer, initialLayout);
	return (
		<ViewsProvider value={views}>
			<div className={css["layout"]}>
				<LayoutTree layout={layout} dispatch={dispatchLayout} />
			</div>
		</ViewsProvider>
	);
}

type LayoutTreeProps = {
	layout: LayoutDesc;
	dispatch: Dispatch<LayoutAction>;
};
const LayoutTree: FC<LayoutTreeProps> = ({
	layout,
	dispatch,
}) => {
	switch (layout.type) {
		case "split": {
			const { first, second } = layout;
			return (
				<LayoutSplit desc={layout} dispatch={dispatch}>
					<LayoutTree layout={first} dispatch={dispatch} />
					<LayoutTree layout={second} dispatch={dispatch} />
				</LayoutSplit>
			);
		}
		case "view": {
			const { } = layout;
			return (
				<LayoutViewMemo desc={layout} dispatch={dispatch} />
			);
		}
	}
	const errorMessage = `Layout error: could not make \n${JSON.stringify(layout, null, "\t")}`;
	throw new Error(errorMessage, { cause: layout });
}