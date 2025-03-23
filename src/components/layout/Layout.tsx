import { Dispatch, FC, Reducer, useReducer } from "react";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutView } from "./LayoutView.tsx";



/* 
Goal:
Be able to edit some arbitrary data with multiple views
tagged data?

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
export type LayoutDescSplit = BaseDesc<"split"> & {
	axis: "x" | "y";
	ratio: number;
	first: LayoutDesc;
	second: LayoutDesc;
};
export type LayoutDescView = BaseDesc<"view"> & {
	view: string;
};

export type LayoutDesc = (
	| LayoutDescSplit
	| LayoutDescView
);

type BaseAction<T extends string> = {
	type: T;
	target: LayoutDesc;
};
export type LayoutAction = (
	| BaseAction<"set_ratio"> & {
		ratio: number;
	}
	| BaseAction<"set_view"> & {
		view: string;
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
		case "set_ratio": {
			const { target, ratio } = action;
			const [found, newLayout] = setInLayout(layout, target, {
				...target, 
				ratio,
			});

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
	}
}

type LayoutProps = {
	layout: LayoutDesc;
};
export const Layout: FC<LayoutProps> = ({
	layout: initialLayout
}) => {
	const [layout, dispatchLayout] = useReducer(layoutReducer, initialLayout);
	return (
		<LayoutTree layout={layout} dispatch={dispatchLayout} />
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
			const { axis, ratio, first, second } = layout;
			return (
				<LayoutSplit desc={layout} dispatch={dispatch}>
					<LayoutTree layout={first} dispatch={dispatch} />
					<LayoutTree layout={second} dispatch={dispatch} />
				</LayoutSplit>
			);
		}
		case "view": {
			const { view } = layout;
			return (
				<LayoutView desc={layout} dispatch={dispatch} />
			);
		}
	}
	return (
		<div>Layout error</div>
	)
}