import { Dispatch, FC, memo, ReactNode } from "react";
import css from "./LayoutView.module.css";
import { LayoutAction, LayoutDescView, LayoutFC, useViews } from "./Layout.tsx";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { DropdownSelectSectioned, Options } from "../form/DropdownSelectSectioned.tsx";
import { classList } from "../utils.tsx";
import { Translate } from "../translate/Translate.tsx";
import { Option } from "../form/DropdownSelectList.tsx";

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
				<h1><Translate values={{ view }}>error.layout.view.unknown</Translate></h1>
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
				Object.entries(Object.groupBy<string, Option<string>>(
					[...views.keys(), "aaaaa.aaaaa", "aaaaa.8291edajdbkajsdbajdabjdkjk"].map(name => (
						{
							value: name,
							display: () => <Translate values={{ view: name }}>layout.view.name</Translate>,
							name,
						}
					)), ({ name }) => name.split(".")[0]
				)).map<Options<string>[number]>(([name, options]) => ({
					name,
					label: <Translate values={{ category: name }}>layout.view.category.name</Translate>,
					options: options ?? [],
				})) satisfies Options<string>
			} onSelect={value => dispatch({
				type: "set_view",
				target: view,
				view: value,
			})} />
		</div>
	);
}