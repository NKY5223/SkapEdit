import { useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { makeSection, Sections, makeSingle } from "@components/contextmenu/ContextMenu.ts";
import { FC, memo, ReactNode } from "react";
import { createId } from "../../common/uuid.ts";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { toClassName } from "../utils.tsx";
import { Layout, LayoutFC, useDispatchLayout, useViewProvider } from "./layout.ts";
import { makeSplitX, makeSplitY } from "./layout.ts";
import css from "./LayoutView.module.css";
import { ViewSelector } from "./LayoutViewToolbar.tsx";

type LayoutViewProps = {
};
export const LayoutView: LayoutFC<Layout.ViewNode, LayoutViewProps> = ({
	node,
}) => {
	const dispatchLayout = useDispatchLayout();
	const contextMenu = useContextMenu([
		makeSection(Sections.layout, [
			makeSingle("layout.split-x", "split_scene_left", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitX(0.5,
					node,
					makeView(node.providerName),
				)
			})),
			makeSingle("layout.split-y", "split_scene_up", () => dispatchLayout({
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
		const className = toClassName(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} {...contextMenu}>
				<ViewSelector view={node} dispatch={dispatchLayout} />
				<h1>
					<Translate k="error.layout.view.unknown" viewProviderName={node.providerName} />
				</h1>
			</div>
		);
	}
	const {
		name,
		Component: ViewComp,
	} = provider;

	return (
		<ErrorBoundary location={`LayoutView(${name})`}>
			<div className={css.view} {...contextMenu}>
				<ViewComp viewSwitch={<ViewSelector view={node} dispatch={dispatchLayout} />} />
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ node: a }, { node: b }) => (a === b));

export const makeView = (providerName: string): Layout.ViewNode => {
	return {
		type: "view",
		id: createId("layout.view"),
		providerName,
	};
};