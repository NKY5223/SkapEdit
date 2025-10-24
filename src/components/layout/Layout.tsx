import { FC } from "react";
import { LayoutSplit } from "./LayoutSplit.tsx";
import { LayoutViewMemo } from "./LayoutView.tsx";
import { Layout, LayoutProvider, ViewInfoStatesProvider, ViewProvidersProvider } from "./layout.ts";
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
		<ViewInfoStatesProvider value={new Map()}>
			<ViewProvidersProvider value={viewProviders}>
				<LayoutProvider initialValue={initialLayout}>
					{([tree]) => (<div className={css["layout"]}>
						<LayoutNode node={tree.node} />
					</div>)}
				</LayoutProvider>
			</ViewProvidersProvider>
		</ViewInfoStatesProvider>
	);
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
