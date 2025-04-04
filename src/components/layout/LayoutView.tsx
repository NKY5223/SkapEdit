import { FC, memo, ReactNode } from "react";
import css from "./LayoutView.module.css";
import { LayoutDescView, LayoutFC, useView } from "./Layout.tsx";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { classList } from "../utils.tsx";
import { Translate } from "../translate/Translate.tsx";
import { ViewSelector } from "./LayoutViewToolbar.tsx";
import { createId } from "../../common/uuid.ts";
import { useContextMenu } from "../contextmenu/ContextMenu.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<LayoutDescView, LayoutViewProps> = ({
	desc, dispatch,
}) => {
	const createContextMenu = useContextMenu(() => ({
		items: [{
			id: "test0",
			node: "Test 0",
			click: () => console.log("test 0"),
		}, {
			id: "test1",
			node: "Test 1",
			click: () => console.log("test 1"),
		}],
	}));

	const { view } = desc;
	const View = useView(view);
	if (!View) {
		const className = classList(
			css["view"],
			css["unknown"]
		);
		return (
			<div className={className}>
				<ViewSelector view={desc} dispatch={dispatch} />
				<h1><Translate values={{ view }}>error.layout.view.unknown</Translate></h1>
			</div>
		);
	}
	return (
		<ErrorBoundary location={`View "${desc.view}"`}>
			<div className={css.view} onContextMenu={createContextMenu}>
				<View>
					<ViewSelector view={desc} dispatch={dispatch} />
				</View>
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ desc: a }, { desc: b }) => (a === b));

export const makeLayoutView = (view: string): LayoutDescView => ({
	type: "view",
	id: createId(),
	view,
});