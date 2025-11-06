import { makeSection, makeSingle, Sections, useContextMenu } from "@components/contextmenu/ContextMenu.ts";
import { Dispatch, memo } from "react";
import { ErrorBoundary } from "../error/ErrorBoundary.tsx";
import { Translate } from "../translate/Translate.tsx";
import { toClassName } from "../utils.tsx";
import { Layout, makeSplitX, makeSplitY, makeView, useDispatchLayout, useViewProvider } from "./layout.ts";
import css from "./LayoutView.module.css";
import { ViewSelector } from "./LayoutViewToolbar.tsx";

type LayoutViewProps<S, A> = {
	node: Layout.ViewNode<S, A>;
};
export const LayoutView = <S, A>({
	node,
}: LayoutViewProps<S, A>) => {
	const dispatchLayout = useDispatchLayout();
	const provider = useViewProvider<S, A>(node.providerName);

	const contextMenu = useContextMenu([
		makeSection(Sections.layout, [
			makeSingle("layout.split-x", "split_scene_left", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitX(0.5,
					node,
					makeView(provider),
				)
			})),
			makeSingle("layout.split-y", "split_scene_up", () => dispatchLayout({
				type: "replace",
				targetNode: node.id,
				replacement: makeSplitY(0.5,
					node,
					makeView(provider),
				)
			})),
		])
	]);


	if (!provider) {
		const className = toClassName(
			css["view"],
			css["unknown"],
		);
		return (
			<div className={className} {...contextMenu}>
				<ViewSelector view={node} dispatchLayout={dispatchLayout} />
				<h1>
					<Translate k="error.layout.view.unknown" viewProviderName={node.providerName} />
				</h1>
			</div>
		);
	}
	const {
		name,
		Component: ViewComp,
		reducer,
	} = provider;

	const viewSwitch = <ViewSelector view={node} dispatchLayout={dispatchLayout} />;

	const dispatchView: Dispatch<A> = action => {
		dispatchLayout({
			type: "replace",
			targetNode: node.id,
			replacement: {
				...node,
				state: reducer(node.state, action),
			} satisfies Layout.ViewNode<S, A>,
		})
	}

	return (
		<ErrorBoundary location={`LayoutView(${name})`}>
			<div className={css["view"]} {...contextMenu}>
				<ViewComp viewSwitch={viewSwitch} state={node.state} dispatchView={dispatchView} />
			</div>
		</ErrorBoundary>
	);
}
export const LayoutViewMemo = memo(LayoutView, ({ node: a }, { node: b }) => (a === b));