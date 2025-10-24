import { FC } from "react";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutViewMemo } from "./LayoutView.tsx";
import { type Layout, LayoutProvider, ViewInfoStatesProvider, ViewsProviderProvider, useLayoutTree } from "./layout.ts";
import css from "./Layout.module.css";

type LayoutProps = {
	layout: Layout.Tree;
	viewProviders: ReadonlyMap<string, Layout.ViewProvider>;
};
export const LayoutRoot: FC<LayoutProps> = ({
	layout: initialLayout,
	viewProviders,
}) => {
	return (
		<LayoutProvider initialValue={initialLayout}>
			<ViewInfoStatesProvider value={new Map()}>
				<ViewsProviderProvider value={viewProviders}>
					<div className={css["layout"]}>
						<LayoutTree />
					</div>
				</ViewsProviderProvider>
			</ViewInfoStatesProvider>
		</LayoutProvider>
	);
}

const LayoutTree: FC<{}> = () => {
	const tree = useLayoutTree();
	return (<LayoutNode node={tree.node} />);
}

type LayoutNodeProps = {
	node: Layout.Node;
};
const LayoutNode: FC<LayoutNodeProps> = ({
	node,
}) => {
	switch (node.type) {
		case "split": {
			const { first, second } = node;
			return (
				<LayoutSplit node={node}>
					<LayoutNode node={first} />
					<LayoutNode node={second} />
				</LayoutSplit>
			);
		}
		case "view": {
			const { } = node;
			return (
				<LayoutViewMemo node={node} />
			);
		}
	}
	const errorMessage = `Layout error: could not make \n${JSON.stringify(node, null, "\t")}`;
	throw new Error(errorMessage, { cause: node });
}
