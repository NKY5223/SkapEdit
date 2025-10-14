import { useContextMenu } from "@components/contextmenu/context.tsx";
import { section, single } from "@components/contextmenu/ContextMenu.tsx";
import { FC, memo, ReactNode } from "react";
import { createId } from "../../common/uuid.ts";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { classList } from "../utils.tsx";
import { emptyViewProvider, Layout, LayoutFC, useViewProvider } from "./Layout.tsx";
import { makeSplitX, makeSplitY } from "./LayoutSplit.tsx";
import css from "./LayoutView.module.css";
import { ViewSelector } from "./LayoutViewToolbar.tsx";

type ViewProps = {
	children: ReactNode;
};
export type ViewFC = FC<ViewProps>;

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<Layout.NodeView, LayoutViewProps> = ({
	node, dispatchLayout,
}) => {
	const handleContextMenu = useContextMenu([
		section("layout", (<Translate k="layout" />), null, [
			single("split-x", (<Translate k="layout.view.split-x" />), "split_scene_left", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitX(0.5,
					node,
					makeView(emptyViewProvider.name),
				)
			})),
			single("split-y", (<Translate k="layout.view.split-y" />), "split_scene_up", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitY(0.5,
					node,
					makeView(emptyViewProvider.name),
				)
			})),
		])
	]);

	const id = node.id;

	const provider = (useViewProvider(node.providerName) as Layout.ViewProvider | undefined);

	if (!provider) {
		const className = classList(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} onContextMenu={handleContextMenu}>
				<ViewSelector view={node} dispatch={dispatchLayout} />
				<h1><Translate k="error.layout.view.unknown" view={id} /></h1>
			</div>
		);
	}
	const {
		// name,
		Component: ViewComp,
	} = provider;

	return (
		<ErrorBoundary location={`LayoutView(${JSON.stringify(id)})`}>
			<div className={css.view} onContextMenu={handleContextMenu}>
				<ViewComp
					dispatchLayout={dispatchLayout}
					viewSwitch={<ViewSelector view={node} dispatch={dispatchLayout} />}
				/>
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ node: a }, { node: b }) => (a === b));

export const makeView = (providerName: string): Layout.NodeView => {
	return {
		type: "view",
		id: createId("layout.view"),
		providerName,
	};
};