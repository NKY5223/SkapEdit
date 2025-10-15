import { useContextMenu } from "@components/contextmenu/reducer.ts";
import { section, single } from "@components/contextmenu/ContextMenu.ts";
import { FC, memo, ReactNode } from "react";
import { createId } from "../../common/uuid.ts";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { classList } from "../utils.tsx";
import { Layout, LayoutFC, useViewProvider } from "./Layout.tsx";
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
	const addContextMenuItems = useContextMenu([
		section("layout", null, [
			single("split-x", "split_scene_left", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitX(0.5,
					node,
					makeView(node.providerName),
				)
			})),
			single("split-y", "split_scene_up", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitY(0.5,
					node,
					makeView(node.providerName),
				)
			})),
		])
	]);

	const provider = useViewProvider(node.providerName);

	if (!provider) {
		const className = classList(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} onContextMenuCapture={addContextMenuItems}>
				<ViewSelector view={node} dispatch={dispatchLayout} />
				<div>
					<h1>
						<Translate k="error.layout.view.unknown" viewProviderName={node.providerName} />
					</h1>
				</div>
			</div>
		);
	}
	const {
		name,
		Component: ViewComp,
	} = provider;

	return (
		<ErrorBoundary location={`LayoutView(${name})`}>
			<div className={css.view} onContextMenuCapture={addContextMenuItems}>
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