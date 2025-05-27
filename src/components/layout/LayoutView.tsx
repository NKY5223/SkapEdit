import { useContextMenu } from "@components/contextmenu/context.tsx";
import { section, single } from "@components/contextmenu/ContextMenu.tsx";
import { FC, memo, ReactNode } from "react";
import { createId } from "../../common/uuid.ts";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { classList } from "../utils.tsx";
import { LayoutDescView, LayoutFC, useView } from "./Layout.tsx";
import { makeSplitX, makeSplitY } from "./LayoutSplit.tsx";
import css from "./LayoutView.module.css";
import { ViewSelector } from "./LayoutViewToolbar.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	desc, dispatch,
}) => {
	const { view } = desc;
	const handleContextMenu = useContextMenu([
		section("layout", (<Translate k="layout" />), null, [
			single("split-x", (<Translate k="layout.view.split-x" />), "split-x", () => dispatch({
				type: "replace",
				target: desc,
				desc: makeSplitX(0.5,
					desc,
					makeView(null),
				)
			})),
			single("split-y", (<Translate k="layout.view.split-y" />), "split-y", () => dispatch({
				type: "replace",
				target: desc,
				desc: makeSplitY(0.5,
					desc,
					makeView(null),
				)
			})),
		])
	]);

	if (view === null) {
		const className = classList(
			css["view"],
			css["empty"],
		);
		return (
			<div className={className} onContextMenu={handleContextMenu}>
				<ViewSelector view={desc} dispatch={dispatch} />
				<div className={css["empty-content"]}>
					<Translate k="layout.view.empty" />
				</div>
			</div>
		);
	}
	const View = useView(view);
	if (!View) {
		const className = classList(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} onContextMenu={handleContextMenu}>
				<ViewSelector view={desc} dispatch={dispatch} />
				<h1><Translate k="error.layout.view.unknown" view={view} /></h1>
			</div>
		);
	}


	return (
		<ErrorBoundary location={`LayoutView(${JSON.stringify(desc.view)})`}>
			<div className={css.view} onContextMenu={handleContextMenu}>
				<View>
					<ViewSelector view={desc} dispatch={dispatch} />
				</View>
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ desc: a }, { desc: b }) => (a === b));

export const makeView = (view: string | null): LayoutDescView => ({
	type: "view",
	id: createId(),
	view,
});