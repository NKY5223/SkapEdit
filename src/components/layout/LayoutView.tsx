import { Dispatch, FC, ReactNode } from "react";
import css from "./Layout.module.css";
import { LayoutAction, LayoutDescView, LayoutFC } from "./Layout.tsx";
import { Button } from "../form/Button.tsx";

type ViewProps = {
	viewSelector: ReactNode;
};
export type ViewFC = FC<ViewProps>;
export const viewRegistry: Map<string, ViewFC> = new Map();

type LayoutViewProps = {

};

export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	dispatch,
	desc,
}) => {
	const { view } = desc;
	const F = viewRegistry.get(view);
	const viewSelector = (<ViewSelector view={desc} dispatch={dispatch} />);
	if (!F) {
		return (
			<div className={css.view}>
				{viewSelector}
				Unknown view: {view}
			</div>
		);
	}
	return (
		<div className={css.view}>
			<F viewSelector={viewSelector} />
		</div>
	);
}
type ViewSelectorProps = {
	view: LayoutDescView;
	dispatch: Dispatch<LayoutAction>;
};
const ViewSelector: FC<ViewSelectorProps> = ({
	view, dispatch
}) => {
	return (
		<div>
			<Button onClick={() => {
				dispatch({
					type: "set_view",
					target: view,
					view: prompt(`new view: (options: ${[...viewRegistry.keys()].join(", ")})`) ?? "?",
				})
			}}>Current view: {view.view}</Button>
		</div>
	);
}