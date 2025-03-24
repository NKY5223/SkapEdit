import { Dispatch, FC, memo, ReactNode, useEffect, useMemo } from "react";
import css from "./LayoutView.module.css";
import { LayoutAction, LayoutDescView, LayoutFC, useViews } from "./Layout.tsx";
import { Button } from "../form/Button.tsx";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { DropdownSelectList } from "../form/DropdownSelectList.tsx";
import { DropdownSelectSectioned } from "../form/DropdownSelectSectioned.tsx";
import { classList } from "../utils.tsx";

type ViewProps = {
	viewSelector: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	desc, dispatch,
}) => {
	const views = useViews();
	const { view } = desc;
	const View = views.get(view);
	const viewSelector = (<ViewSelector view={desc} dispatch={dispatch} />);
	if (!View) {
		const className = classList(
			css["view"],
			css["unknown"]
		);
		return (
			<div className={className}>
				{viewSelector}
				<h1>Unknown view: {view}</h1>
			</div>
		);
	}
	return (
		<ErrorBoundary location={`View "${desc.view}"`}>
			<div className={css.view}>
				<View viewSelector={viewSelector} />
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ desc: a }, { desc: b }) => (a === b));


type ViewSelectorProps = {
	view: LayoutDescView;
	dispatch: Dispatch<LayoutAction>;
};
export const ViewSelector: FC<ViewSelectorProps> = ({
	view, dispatch
}) => {
	const views = useViews();

	return (
		<div style={{
			display: "flex",
			flexDirection: "row",
		}}>
			<DropdownSelectSectioned initial={view.view} options={
				Object.entries(Object.groupBy([...views.keys(), "aaaaa.aaaaa", "aaaaa.8291edajdbkajsdbajdabjdkjk"].map(name => (
					{
						value: name,
						display: () => name,
						name,
					}
				)), ({ name }) => name.split(".")[0])).map(([name, options]) => ({
					name,
					label: name,
					options: options ?? [],
				}))
			} onSelect={value => dispatch({
				type: "set_view",
				target: view,
				view: value,
			})} />
		</div>
	);
}